import manifestConfig from '../../plugin.config.json';

export const { pluginId: APP_KEY, siteDomain, apiHostPrefix } = manifestConfig;



export const requestHost = siteDomain;
export const apiHost = apiHostPrefix;


export type FieldTypeKey = keyof typeof FIELD_TYPE_NAME;

export const FIELD_TYPE_NAME = {
  text: () => '文本',
  multi_pure_text: () => '多行文本',
  link: () => '链接',
  date: () => '日期',
  schedule: () => '日期区间',
  precise_date: () => '日期+时间',
  number: () => '数字',
  work_item_related_select: () => '关联工作项',
  work_item_related_multi_select: () => '多选关联工作项',
  signal: () => '信号',
  bool: () => '开关',
  radio: () => '单选按钮',
  select: () => '单选',
  multi_select: () => '多选',
  tree_select: () => '级联单选',
  tree_multi_select: () => '级联多选',
  user: () => '单选人员',
  multi_user: () => '多选人员',
  compound_field: () => '复合字段',
  multi_text: () => '富文本',
  file: () => '文件',
  multi_file: () => '附件',
  aborted: () => '终止',
  deleted: () => '删除',
  role_owners: () => '角色人员',
  linked_work_item: () => '关联工作项',
  business: () => '业务线',
  chat_group: () => '群id',
  group_id: () => '群id',
  group_type: () => '拉群方式',
  work_item_template: () => '模板类型',
  approver_user: () => '审批人',
  work_item_status: () => '工作项状态',
  vote_option: () => '投票',
  vote_option_multi: () => '多选投票',
  dynamic_input: () => '动态输入',
  dateInterval: () => '日期区间',
};
