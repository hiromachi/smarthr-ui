import { action } from '@storybook/addon-actions'
import { Story } from '@storybook/react'
import * as React from 'react'
import styled from 'styled-components'

import { DatePicker } from './DatePicker'

export default {
  title: 'DatePicker',
  component: DatePicker,
}

export const All: Story = () => {
  const [value, setValue] = React.useState<string>(new Date(2020, 0, 1).toDateString())
  return (
    <List>
      <dt>DatePicker</dt>
      <dd>
        <DatePicker onChangeDate={action('change')} data-test="datepicker-1" />
      </dd>
      <dt>Pass `from`, `to`</dt>
      <dd>
        <DatePicker
          from={new Date(1901, 0, 1)}
          to={new Date(2100, 11, 30)}
          onChangeDate={action('change')}
        />
      </dd>
      <dt>Custom format (ex. Date.toDateString)</dt>
      <dd>
        <DatePicker
          value={value}
          formatDate={(_date) => {
            if (!_date) return ''
            return _date.toDateString()
          }}
          onChangeDate={(_date, _value, _other) => {
            action('change')(_date, _value, _other)
            setValue(_value)
          }}
        />
      </dd>
      <dt>Show Alternative Formatted Date</dt>
      <dd>
        <DatePicker value="1994/09/28" showAlternative={() => '平成6年9月28日'} />
      </dd>
      <dt>Disabled</dt>
      <dd>
        <DatePicker disabled />
      </dd>
      <dt>Extending style (width: 50%)</dt>
      <dd>
        <ExtendingDatePicker onChangeDate={action('change')} />
      </dd>
      <dt className="bottom">Place on the page bottom</dt>
      <dd>
        <DatePicker onChangeDate={action('change')} />
      </dd>
    </List>
  )
}
All.storyName = 'all'

const List = styled.dl`
  padding: 24px;
  margin: 0;

  dd {
    margin: 10px 0 20px;
  }
  dt.bottom {
    margin-top: 1000px;
  }
`

const ExtendingDatePicker = styled(DatePicker)`
  width: 50%;
`
