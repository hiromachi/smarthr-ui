import { action } from '@storybook/addon-actions'
import { Story } from '@storybook/react'
import React, { FC, useState } from 'react'
import styled, { css } from 'styled-components'

import { Base } from '../Base'
import { Button } from '../Button'
import { FormGroup } from '../FormGroup'
import { Input } from '../Input'

import { AccordionPanel } from './AccordionPanel'
import { AccordionPanelContent } from './AccordionPanelContent'
import { AccordionPanelItem } from './AccordionPanelItem'
import { AccordionPanelTrigger } from './AccordionPanelTrigger'

export default {
  title: 'AccordionPanel',
  component: AccordionPanel,
  subcomponents: {
    AccordionPanelItem,
    AccordionPanelContent,
    AccordionPanelTrigger,
  },
  parameters: {
    withTheming: true,
  },
}

const arr = Array.from({ length: 3 })
// prettier-ignore
const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const content = () => {
  const id = Math.random()
  return (
    <Stack>
      <div>{lorem}</div>
      <div>
        <FormGroup
          title="Name"
          titleType="subBlockTitle"
          innerMargin="XXS"
          htmlFor={`id-name-${id}`}
        >
          <Input id={`id-name-${id}`} />
        </FormGroup>
      </div>
      <div>
        <FormGroup
          title="Email"
          titleType="subBlockTitle"
          innerMargin="XXS"
          htmlFor={`id-email-${id}`}
        >
          <Input id={`id-email-${id}`} />
        </FormGroup>
      </div>
    </Stack>
  )
}

const AccordionPanelController: FC = () => {
  const [expandedId, setExpandedId] = useState('')

  const Buttons = styled.div`
    margin-bottom: 16px;

    > *:not(:first-child) {
      margin-left: 16px;
    }
  `

  return (
    <Wrapper>
      <Buttons>
        {arr.map((_, i) => (
          <Button
            key={`button-${i}`}
            onClick={() => setExpandedId(`accordion-panel-${i}`)}
            aria-controls={`accordion-panel-${i}-content`}
          >
            open {i}
          </Button>
        ))}
      </Buttons>

      <Base>
        <AccordionPanel defaultExpanded={[expandedId]}>
          {arr.map((_, i) => (
            <AccordionPanelItem key={i} name={`accordion-panel-${i}`}>
              <AccordionPanelTrigger>AccordionPanelItem {i}</AccordionPanelTrigger>
              <AccordionPanelContent>
                <Content>{content()}</Content>
              </AccordionPanelContent>
            </AccordionPanelItem>
          ))}
        </AccordionPanel>
      </Base>
    </Wrapper>
  )
}

export const AccordionStyle: Story = () => {
  return (
    <Wrapper>
      <Base>
        <AccordionPanel>
          <BorderList>
            {arr.map((_, i) => (
              <li key={i}>
                <AccordionPanelItem name={`left-icon-${i}`}>
                  <AccordionPanelTrigger>Left Icon (default) {i}</AccordionPanelTrigger>
                  <AccordionPanelContent>
                    <Content>{content()}</Content>
                  </AccordionPanelContent>
                </AccordionPanelItem>
              </li>
            ))}
          </BorderList>
        </AccordionPanel>
      </Base>
      <Base>
        <AccordionPanel iconPosition="right">
          <BorderList>
            {arr.map((_, i) => (
              <li key={i}>
                <AccordionPanelItem name={`right-icon-${i}`}>
                  <AccordionPanelTrigger>Right Icon {i}</AccordionPanelTrigger>
                  <AccordionPanelContent>
                    <Content>{content()}</Content>
                  </AccordionPanelContent>
                </AccordionPanelItem>
              </li>
            ))}
          </BorderList>
        </AccordionPanel>
      </Base>
      <Base>
        <AccordionPanel displayIcon={false}>
          <BorderList>
            {arr.map((_, i) => (
              <li key={i}>
                <AccordionPanelItem name={`no-icon-${i}`}>
                  <AccordionPanelTrigger>No Icon {i}</AccordionPanelTrigger>
                  <AccordionPanelContent>
                    <Content>{content()}</Content>
                  </AccordionPanelContent>
                </AccordionPanelItem>
              </li>
            ))}
          </BorderList>
        </AccordionPanel>
      </Base>
    </Wrapper>
  )
}
AccordionStyle.storyName = 'Accordion style'

export const ExpandedOptions: Story = () => {
  return (
    <Wrapper>
      <Base>
        <AccordionPanel displayIcon={true} expandableMultiply={true}>
          {arr.map((_, i) => (
            <AccordionPanelItem key={i} name={`expandable-multiply-${i}`}>
              <AccordionPanelTrigger>Expandable Multiply {i}</AccordionPanelTrigger>
              <AccordionPanelContent>
                <Content>{content()}</Content>
              </AccordionPanelContent>
            </AccordionPanelItem>
          ))}
        </AccordionPanel>
      </Base>
      <Base>
        <AccordionPanel displayIcon={true} defaultExpanded={['default-expanded-0']}>
          {arr.map((_, i) => (
            <AccordionPanelItem key={i} name={`default-expanded-${i}`}>
              <AccordionPanelTrigger>Default Expanded {i}</AccordionPanelTrigger>
              <AccordionPanelContent>
                <Content>{content()}</Content>
              </AccordionPanelContent>
            </AccordionPanelItem>
          ))}
        </AccordionPanel>
      </Base>
    </Wrapper>
  )
}
ExpandedOptions.storyName = 'Expanded options'

export const Callback: Story = () => {
  return (
    <Wrapper>
      <Base>
        <AccordionPanel displayIcon={false} expandableMultiply={true} onClick={action('Clicked')}>
          {arr.map((_, i) => (
            <AccordionPanelItem key={i} name={`expandable-multiply-${i}`}>
              <AccordionPanelTrigger>Expandable Multiply {i}</AccordionPanelTrigger>
              <AccordionPanelContent>
                <Content>{content()}</Content>
              </AccordionPanelContent>
            </AccordionPanelItem>
          ))}
        </AccordionPanel>
      </Base>
    </Wrapper>
  )
}

export const ChangeDefaultExpanded: Story = () => {
  return <AccordionPanelController />
}
ChangeDefaultExpanded.storyName = 'Change defaultExpanded'

const Wrapper = styled.div`
  padding: 24px;

  > * + * {
    margin-top: 24px;
  }
`
const BorderList = styled.ul(
  ({ theme: { color } }) => css`
    margin: 0;
    padding: 0;
    list-style: none;

    > li + li {
      border-top: 1px solid ${color.BORDER};
    }
  `,
)
const Content = styled.div(
  ({ theme: { color } }) => css`
    background-color: ${color.BACKGROUND};
    padding: 16px;
  `,
)
const Stack = styled.div`
  > * + * {
    margin-top: 12px;
  }
`
