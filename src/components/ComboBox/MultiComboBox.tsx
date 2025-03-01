import React, {
  ChangeEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled, { css } from 'styled-components'

import { useId } from '../../hooks/useId'
import { useOuterClick } from '../../hooks/useOuterClick'
import { Theme, useTheme } from '../../hooks/useTheme'
import { FaCaretDownIcon } from '../Icon'

import { ComboBoxContext } from './ComboBoxContext'
import { MultiSelectedItem } from './MultiSelectedItem'
import { hasParentElementByClassName } from './multiComboBoxHelper'
import { ComboBoxItem } from './types'
import { useMultiComboBoxClassNames } from './useClassNames'
import { useFocusControl } from './useFocusControl'
import { useListBox } from './useListBox'
import { useOptions } from './useOptions'

type Props<T> = {
  /**
   * 選択可能なアイテムのリスト
   */
  items: Array<ComboBoxItem<T>>
  /**
   * 選択されているアイテムのリスト
   */
  selectedItems: Array<ComboBoxItem<T> & { deletable?: boolean }>
  /**
   * input 要素の `name` 属性の値
   */
  name?: string
  /**
   * input 要素の `disabled` 属性の値
   */
  disabled?: boolean
  /**
   * `true` のとき、コンポーネントの外枠が `DANGER` カラーになる
   */
  error?: boolean
  /**
   * `true` のとき、 `items` 内に存在しないアイテムを新しく追加できるようになる
   */
  creatable?: boolean
  /**
   * input 要素の `placeholder` 属性の値
   */
  placeholder?: string
  /**
   * ドロップダウンリスト内に表示するヘルプメッセージ
   */
  dropdownHelpMessage?: ReactNode
  /**
   * `true` のとき、ドロップダウンリスト内にローダーを表示する
   */
  isLoading?: boolean
  /**
   * 選択されているアイテムのラベルを省略表示するかどうか
   */
  selectedItemEllipsis?: boolean
  /**
   * input 要素の `width` スタイルに適用する値
   */
  width?: number | string
  /**
   * ドロップダウンリストの `width` スタイルに適用する値
   */
  dropdownWidth?: number | string
  /**
   * テキストボックスの `value` 属性の値。
   * `onChangeInput` と併せて設定することで、テキストボックスの挙動が制御可能になる。
   */
  inputValue?: string
  /**
   * コンポーネント内の一番外側の要素に適用するクラス名
   */
  className?: string
  /**
   * input 要素の `value` が変わった時に発火するコールバック関数
   * @deprecated `onChange` は非推奨なため、代わりに `onChangeInput` を使用してください。
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * input 要素の `value` が変わった時に発火するコールバック関数
   */
  onChangeInput?: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * `items` 内に存在しないアイテムが追加されたときに発火するコールバック関数
   */
  onAdd?: (label: string) => void
  /**
   * 選択されているアイテムの削除ボタンがクリックされた時に発火するコールバック関数
   */
  onDelete?: (item: ComboBoxItem<T>) => void
  /**
   * アイテムが選択された時に発火するコールバック関数
   */
  onSelect?: (item: ComboBoxItem<T>) => void
  /**
   * 選択されているアイテムのリストが変わった時に発火するコールバック関数
   */
  onChangeSelected?: (selectedItems: Array<ComboBoxItem<T>>) => void
  /**
   * コンポーネントがフォーカスされたときに発火するコールバック関数
   */
  onFocus?: () => void
  /**
   * コンポーネントからフォーカスが外れた時に発火するコールバック関数
   */
  onBlur?: () => void
  /**
   * コンポーネント内のテキストを変更する関数/
   */
  decorator?: {
    noResultText?: (text: string) => ReactNode
    destroyButtonIconAlt?: (text: string) => string
    selectedListAriaLabel?: (text: string) => string
  }
}

type ElementProps<T> = Omit<HTMLAttributes<HTMLDivElement>, keyof Props<T>>

const SELECTED_LIST_ARIA_LABEL = '選択済みアイテム'

export function MultiComboBox<T>({
  items,
  selectedItems,
  name,
  disabled = false,
  error = false,
  creatable = false,
  placeholder = '',
  dropdownHelpMessage,
  isLoading,
  selectedItemEllipsis,
  width = 'auto',
  dropdownWidth = 'auto',
  inputValue: controlledInputValue,
  className = '',
  onChange,
  onChangeInput,
  onAdd,
  onDelete,
  onSelect,
  onChangeSelected,
  onFocus,
  onBlur,
  decorator,
  ...props
}: Props<T> & ElementProps<T>) {
  const theme = useTheme()
  const classNames = useMultiComboBoxClassNames()
  const outerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const isInputControlled = useMemo(
    () => controlledInputValue !== undefined,
    [controlledInputValue],
  )
  const [uncontrolledInputValue, setUncontrolledInputValue] = useState('')
  const inputValue = isInputControlled ? controlledInputValue : uncontrolledInputValue
  const [isComposing, setIsComposing] = useState(false)
  const { options } = useOptions({
    items,
    selected: selectedItems,
    creatable,
    inputValue,
  })
  const handleDelete = useCallback(
    (item: ComboBoxItem<T>) => {
      onDelete && onDelete(item)
      onChangeSelected &&
        onChangeSelected(
          selectedItems.filter(
            (selected) => selected.label !== item.label || selected.value !== item.value,
          ),
        )
    },
    [onChangeSelected, onDelete, selectedItems],
  )
  const handleSelect = useCallback(
    (selected: ComboBoxItem<T>) => {
      const matchedSelectedItem = selectedItems.find(
        (item) => item.label === selected.label && item.value === selected.value,
      )
      if (matchedSelectedItem !== undefined) {
        if (matchedSelectedItem.deletable !== false) {
          handleDelete(selected)
        }
      } else {
        onSelect && onSelect(selected)
        onChangeSelected && onChangeSelected(selectedItems.concat(selected))
      }
    },
    [handleDelete, onChangeSelected, onSelect, selectedItems],
  )

  const {
    renderListBox,
    activeOption,
    handleKeyDown: handleListBoxKeyDown,
    listBoxId,
    listBoxRef,
  } = useListBox({
    options,
    dropdownHelpMessage,
    dropdownWidth,
    onAdd,
    onSelect: handleSelect,
    isExpanded: isFocused,
    isLoading,
    triggerRef: outerRef,
    decorator,
  })

  const {
    deletionButtonRefs,
    inputRef,
    focusPrevDeletionButton,
    focusNextDeletionButton,
    resetDeletionButtonFocus,
  } = useFocusControl(selectedItems.length)

  const focus = useCallback(() => {
    onFocus && onFocus()
    setIsFocused(true)
  }, [onFocus])
  const blur = useCallback(() => {
    if (!isFocused) return
    onBlur && onBlur()
    setIsFocused(false)
    resetDeletionButtonFocus()
  }, [isFocused, onBlur, resetDeletionButtonFocus])

  const caretIconColor = useMemo(() => {
    if (isFocused) return theme.color.TEXT_BLACK
    if (disabled) return theme.color.TEXT_DISABLED
    return theme.color.TEXT_GREY
  }, [disabled, isFocused, theme])

  useOuterClick([outerRef, listBoxRef], blur)

  useLayoutEffect(() => {
    if (!isInputControlled) {
      setUncontrolledInputValue('')
    }

    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef, isFocused, isInputControlled, selectedItems])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (isComposing) {
        return
      } else if (e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation()
        blur()
      } else if (e.key === 'Tab') {
        if (isFocused) {
          // フォーカスがコンポーネントを抜けるように先に input をフォーカスしておく
          inputRef.current?.focus()
        }
        blur()
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        e.stopPropagation()
        focusPrevDeletionButton()
      } else if (e.key === 'Right' || e.key === 'ArrowRight') {
        e.stopPropagation()
        focusNextDeletionButton()
      } else {
        e.stopPropagation()
        inputRef.current?.focus()
        resetDeletionButtonFocus()
      }
      handleListBoxKeyDown(e)
    },
    [
      blur,
      focusNextDeletionButton,
      focusPrevDeletionButton,
      handleListBoxKeyDown,
      inputRef,
      isComposing,
      isFocused,
      resetDeletionButtonFocus,
    ],
  )

  const handleInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Down' || e.key === 'ArrowDown' || e.key === 'Up' || e.key === 'ArrowUp') {
      // 上下キー入力はリストボックスの activeDescendant の移動に用いるため、input 内では作用させない
      e.preventDefault()
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      listBoxClassNames: classNames.listBox,
    }),
    [classNames.listBox],
  )

  const wrapperClassNames = [
    className,
    isFocused && 'focused',
    error && 'invalid',
    disabled && 'disabled',
    classNames.wrapper,
  ]
    .filter((text) => text !== false && text !== '')
    .join(' ')
  const selectedListId = useId()

  return (
    <ComboBoxContext.Provider value={contextValue}>
      <Container
        {...props}
        themes={theme}
        width={width}
        ref={outerRef}
        className={wrapperClassNames}
        onClick={(e) => {
          if (
            !hasParentElementByClassName(e.target as HTMLElement, classNames.deleteButton) &&
            !disabled &&
            !isFocused
          ) {
            focus()
          }
        }}
        onKeyDown={handleKeyDown}
        role="group"
      >
        <InputArea themes={theme}>
          <SelectedList
            id={selectedListId}
            aria-label={
              decorator?.selectedListAriaLabel
                ? decorator.selectedListAriaLabel(SELECTED_LIST_ARIA_LABEL)
                : SELECTED_LIST_ARIA_LABEL
            }
            className={classNames.selectedList}
          >
            {selectedItems.map((selectedItem, i) => (
              <li key={`${selectedItem.label}-${selectedItem.value}`}>
                <MultiSelectedItem
                  item={selectedItem}
                  disabled={disabled}
                  onDelete={handleDelete}
                  enableEllipsis={selectedItemEllipsis}
                  buttonRef={deletionButtonRefs[i]}
                  decorator={decorator}
                />
              </li>
            ))}
          </SelectedList>

          <InputWrapper className={isFocused ? undefined : 'hidden'}>
            <Input
              type="text"
              name={name}
              value={inputValue}
              disabled={disabled}
              ref={inputRef}
              themes={theme}
              onChange={(e) => {
                if (onChange) onChange(e)
                if (onChangeInput) onChangeInput(e)
                if (!isInputControlled) {
                  setUncontrolledInputValue(e.currentTarget.value)
                }
              }}
              onFocus={() => {
                resetDeletionButtonFocus()
                if (!isFocused) {
                  focus()
                }
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={handleInputKeyDown}
              autoComplete="off"
              tabIndex={0}
              role="combobox"
              aria-activedescendant={activeOption?.id}
              aria-controls={`${listBoxId} ${selectedListId}`}
              aria-haspopup="listbox"
              aria-expanded={isFocused}
              aria-invalid={error || undefined}
              aria-disabled={disabled}
              aria-autocomplete="list"
              className={classNames.input}
            />
          </InputWrapper>

          {selectedItems.length === 0 && placeholder && !isFocused && (
            <Placeholder themes={theme} className={classNames.placeholder}>
              {placeholder}
            </Placeholder>
          )}
        </InputArea>

        <Suffix themes={theme} disabled={disabled}>
          <FaCaretDownIcon color={caretIconColor} />
        </Suffix>

        {renderListBox()}
      </Container>
    </ComboBoxContext.Provider>
  )
}

const Container = styled.div<{ themes: Theme; width: number | string }>`
  ${({ themes, width }) => {
    const { border, radius, color, shadow, spacingByChar } = themes

    return css`
      display: inline-flex;
      min-width: calc(62px + 32px + ${spacingByChar(0.5)} * 2);
      width: ${typeof width === 'number' ? `${width}px` : width};
      min-height: 40px;
      border-radius: ${radius.m};
      border: ${border.shorthand};
      box-sizing: border-box;
      background-color: ${color.WHITE};
      color: ${color.TEXT_GREY};
      cursor: text;

      &.focused {
        box-shadow: ${shadow.OUTLINE};
      }

      &.invalid {
        border-color: ${color.DANGER};
      }

      &.disabled {
        cursor: not-allowed;
        border-color: ${color.disableColor(color.BORDER)};
        background-color: ${color.hoverColor(color.WHITE)};
        color: ${color.TEXT_DISABLED};
      }
    `
  }}
`
const InputArea = styled.div<{ themes: Theme }>`
  ${({ themes: { spacingByChar } }) => css`
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: ${spacingByChar(0.5)};
    min-height: calc(1em + ${spacingByChar(0.5)} * 2);
    max-height: 300px;
    margin: ${spacingByChar(0.25)} ${spacingByChar(0.5)};
    overflow-y: auto;
  `}
`
const SelectedList = styled.ul`
  display: contents;
  list-style: none;
  li {
    /** 選択済みアイテムのラベルの省略表示のために幅を計算させる */
    min-width: 0;
  }
`
const InputWrapper = styled.div`
  &.hidden {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  flex: 1;
  display: flex;
  align-items: center;
`
const Input = styled.input<{ themes: Theme }>`
  ${({ themes }) => {
    const { color, fontSize, spacingByChar } = themes

    return css`
      min-width: 80px;
      width: 100%;
      min-height: calc(1em + ${spacingByChar(0.5)} * 2);
      border: none;
      font-size: ${fontSize.M};
      color: ${color.TEXT_BLACK};
      box-sizing: border-box;
      outline: none;
      &[disabled] {
        display: none;
      }
    `
  }}
`
const Placeholder = styled.p<{ themes: Theme }>`
  ${({ themes }) => {
    const { fontSize } = themes

    return css`
      margin: 0;
      align-self: center;
      font-size: ${fontSize.M};
    `
  }}
`
const Suffix = styled.div<{ themes: Theme; disabled: boolean }>`
  ${({ themes: { color, spacingByChar }, disabled }) => {
    const space = spacingByChar(0.5)

    return css`
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: ${space};
      padding-left: calc(${space} + 1px);
      box-sizing: border-box;
      cursor: ${disabled ? 'not-allowed' : 'pointer'};

      &::before {
        content: '';
        position: absolute;
        top: ${space};
        left: 0;
        display: block;
        width: 1px;
        background-color: ${color.BORDER};
        height: calc(100% - ${space} * 2);
      }
    `
  }}
`
