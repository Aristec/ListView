import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LocalityList from './LocalityList.vue'
import type { Locality } from '../api/types'

describe('LocalityList', () => {
  it('renders empty state', () => {
    const wrapper = mount(LocalityList, { props: { items: [] } })
    expect(wrapper.text()).toContain('No localities found')
  })

  it('renders name, id and country name_en', () => {
    const items: Locality[] = [
      {
        id: 1,
        name: 'Hüti F-358 puurauk',
        name_en: 'Hüti F-358 borehole',
        country: { id: 68, name: 'Eesti', name_en: 'Estonia' },
      },
    ]

    const wrapper = mount(LocalityList, { props: { items } })

    // shows name_en first
    expect(wrapper.text()).toContain('Hüti F-358 borehole')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('Estonia')
  })
})