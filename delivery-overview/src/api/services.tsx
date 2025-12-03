/**
 * 接口文档: https://bytedance.feishu.cn/wiki/SmPOwi7G5ieNmdkZjsBcYr33n1e
 */
import request, { limitPost } from "./request";
import type { FieldTypeKey } from "../constants";

// 与 starling_intl 解耦：此文件不再依赖 I18n。

export interface ResponseWrap<D> {
  err_code: number;
  err_msg: string;

  data?: D;
  error?: {
    id: number;
    localizedMessage: {
      locale: string;
      message: string;
    };
  };
}

interface FieldOption {
  label: string;
  value: string | number;
  children?: FieldOption[];
}

export interface NewWorkObjectField {
  field_alias: string;
  field_key: string;
  field_name: string;
  field_type_key: FieldTypeKey;
  free_add: boolean;
  select_options?: FieldOption[];
  tree_options?: FieldOption[];
  // compound_fields?: NewWorkObjectField[]; 复合字段
  value_generate_mode: number;
  options?: FieldOption[];
  is_multi?: boolean;
  format?: string;
  // 关联工作项uuid
  work_item_relation_uuid?: string;
}


export const FieldTypeKeyObj = {
  text: "text",
  "multi-pure-text": "multi_pure_text",
  link: "link",
  // date: 'date',
  // precise_date: 'date',
  schedule: "schedule",
  number: "number",
  workitem_related_select: "work_item_related_select",
  workitem_related_multi_select: "work_item_related_multi_select",
  signal: "signal",
  bool: "bool",
  "multi-signal": "multi_signal",
  radio: "radio",
  tag: "select",
  select: "select",
  "multi-tag": "multi_select",
  "multi-select": "multi_select",
  "tree-select": "tree_select",
  "tree-tag": "tree_select",
  "tree-multi-tag": "tree_multi_select",
  "tree-multi-select": "tree_multi_select",
  user: "user",
  "multi-user": "multi_user",
  compound_field: "compound_field",
  "multi-text": "multi_text",
  file: "file",
  "free-tag": "free_tag",
  "multi-file": "multi_file",
  "vote-boolean": "vote_boolean",
  "vote-option": "vote_option",
  "vote-option-multi": "vote_option_multi",
  aborted: "aborted",
  deleted: "deleted",
  role_owners: "role_owners",
  linked_work_item: "linked_work_item",
  last_update_time: "last_update_time",
  wfState: "wf_state",
  template_version: "template_version",
  business: "business",
  chat_group: "chat_group",
  group_id: "group_id",
  group_type: "group_type",
  template_type: "template_type",
  name: "text",
  owned_project: "owned_project",
  linked_story: "work_item_related_select",
  template: "work_item_template", //保持和属性的类型一致
  //属性的类型
  _work_item_status: "work_item_status",
  _name: "text",
  _stage: "stage",
  "_template-type": "template_type",
  "_sub-stage": "sub_stage",
  _business: "business",
  _work_item_template: "work_item_template",
  _id: "id",
};

export const formatFields = (data: NewWorkObjectField[]) =>
  data.map((i) => {
    let type = FieldTypeKeyObj[i.field_type_key] ?? i.field_type_key;
    if (i.is_multi && i.field_type_key === "text") {
      type = "multi_pure_text";
    }
    if (i.field_type_key === "date" && i.format === "YYYY-MM-DD HH:mm:ss") {
      type = "precise_date";
    }
    return {
      ...i,
      type,
    };
  });

export const fetchWorkObjectFields2 = async (
  projectKey: string,
  workItemKey: string,
  isFormat = true
): Promise<
  Omit<ResponseWrap<any>, "data"> & {
    data: NewWorkObjectField[];
    err_code: number;
  }
> =>
  limitPost<
    unknown,
    {
      data: NewWorkObjectField[];
      err_code: number;
      err_msg: string;
    }
  >(`/open_api/${projectKey}/field/all`, {
    work_item_type_key: workItemKey,
  })
    .then((res) => {
      if (res?.data && Array.isArray(res.data)) {
        if (isFormat) {
          res.data = formatFields(res.data);
        }
      }
      return { ...res, err_code: res.err_code, err_msg: res.err_msg };
    })
    .catch((err) => {
      console.log("fetchWorkObjectFields2====", err);
      return {
        data: [],
        err_code: -1,
        err_msg: "error",
      };
    });

export interface IUserInfo {
  avatar_url: string;
  email: string;
  name_cn: string;
  name_en: string;
  user_key: string;
}

export const fetchUserInfo = (user_keys: string[]) =>
    request.post<unknown, {
      data: IUserInfo[];
      err_code: number;
      err_msg: string;
    }
    >(
    "/open_api/user/query",
    {
      user_keys,
    }
  );
export interface WorkItemInfo {
  id: string;
  // 当前进行中节点(仅节点流有值)
  current_nodes: {
    id: string; //节点id
    name: string; //节点名称
    owners: string[]; //节点负责人userKey列表
  };
  fields: {
    field_alias: string;
    field_key: string;
    field_type_key: string;
    field_value: any;
  };
  relation_fields_detail: {
    field_key: string;
    detail: {
      project_key: string;
      story_id: number;
      work_item_type_key: string;
    }[];
  }[];
}
interface IRelatedItem
  extends Omit<WorkItemInfo, "id" | "relation_fields_detail"> {
  id: number;
  name: string;
}
// 获取指定的关联工作项列表
  export const fetchRelatedWorkItems = (
  projectKey: string,
  workObjectId: string,
  id_list: number[],
  field_keys: string[]
) =>
  
  limitPost<unknown, {
      data: IRelatedItem[];
      err_code: number;
      err_msg: string;
    }
    >(
    `/open_api/${projectKey}/work_item/${workObjectId}/query`,
    {
      work_item_ids: id_list,
      fields:field_keys,
    }
  );
