import React from 'react';
import {
  IconCheckboxTick,
  IconArrowDown,
  IconList,
  IconCalendar,
  IconPaperclip,
  IconLink,
  IconUser,
  IconCheckCircleStroked,
  IconFont,
  IconRadio,
  IconFlowChartStroked,
  IconLikeThumb,
  IconCopy,
} from '@douyinfe/semi-icons';

export const getFieldMsg = {
  bool: { getIcon: () => <IconCheckboxTick />, showType: () => 'tag' },
  business: { getIcon: () => <IconArrowDown />, showType: () => 'tag' },
  compound_field: { getIcon: () => <IconList /> },
  date: { getIcon: () => <IconCalendar />, showType: () => 'date' },
  file: { getIcon: () => <IconPaperclip />, showType: () => 'file' },
  free_tag: { getIcon: () => <IconArrowDown /> },
  link: { getIcon: () => <IconLink />, showType: () => 'link' },
  mix_select: { getIcon: () => <IconUser />, showType: () => 'tag' },
  multi_file: { getIcon: () => <IconPaperclip />, showType: () => 'file' },
  multi_select: { getIcon: () => <IconArrowDown />, showType: () => 'tag' },
  multi_signal: { getIcon: () => <IconCheckCircleStroked /> },
  multi_text: { getIcon: () => <IconFont />, showType: () => 'text', row: () => 3 },
  multi_user: { getIcon: () => <IconUser />, showType: () => 'user' },
  name: { getIcon: () => <IconFont />, showType: () => 'text' },
  number: { getIcon: () => <IconFont />, showType: () => 'text' },
  owned_project: { getIcon: () => <IconFont /> },
  radio: { getIcon: () => <IconRadio />, showType: () => 'tag' },
  schedule: { getIcon: () => <IconCalendar /> },
  select: { getIcon: () => <IconArrowDown />, showType: () => 'tag' },
  signal: { getIcon: () => <IconCheckCircleStroked /> },
  '_sub-stage': { getIcon: () => <IconArrowDown /> },
  '_template-type': { getIcon: () => <IconArrowDown /> },
  text: { getIcon: () => <IconFont />, showType: () => 'text' },
  tree_multi_select: { getIcon: () => <IconFlowChartStroked />, showType: () => 'tag' },
  tree_select: { getIcon: () => <IconFlowChartStroked />, showType: () => 'tag' },
  user: { getIcon: () => <IconUser />, showType: () => 'user' },
  vote_boolean: { getIcon: () => <IconLikeThumb /> },
  vote_option: { getIcon: () => <IconLikeThumb /> },
  vote_option_multi: { getIcon: () => <IconLikeThumb /> },
  work_item_related_multi_select: { getIcon: () => <IconCopy />, showType: () => 'tag' },
  work_item_related_select: { getIcon: () => <IconCopy />, showType: () => 'tag' },
  work_item_status: { getIcon: () => <IconArrowDown />, showType: () => 'tag' },
  work_item_template: { getIcon: () => <IconArrowDown />, showType: () => 'tag' },
};

export const NoSupportType = ['compound_field', 'vote_option', 'vote_option_multi', ]

const genColorToken = (color: string, level = 1) =>
  `var(--semi-color-tag-${color}-${level})`;

const colors = [
  'indigo',
  'yellow',
  'blue',
  'amber',
  'light-blue',
  'orange',
  'cyan',
  'pink',
  'green',
  'red',
  'lime',
  'purple',
  'grey',
  'violet',
];

export const getSelectNewColor = (datelen: number): string => {
  const randomIndex = datelen % colors.length;
  return colors[randomIndex];
};
