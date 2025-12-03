import moment from "moment";
import _groupBy from "lodash/groupBy";
import { type FieldTypeKey } from "../../constants";
import { getMapByLists, getRoleList } from "../../utils";
import { fetchRelatedWorkItems, fetchUserInfo } from "../../api/services";

export const getFlatLists = (
  lists: any[] | undefined,
  curWorkItemTypeKey,
): {
  data: any;
  workItemTypeKey: any;
} => {
  if (!lists) {
    return { data: {}, workItemTypeKey: {} };
  }
  const _workItemTypeKey: Record<string, any> = {};
  const flatLists: Record<string, any>[] = [];

  const recursiveMap = (
    item: any,
    parentObj: any,
    grandParentTypeKey: string
  ) => {
    flatLists.push({
      ...item,
      ...parentObj,
      wbs_status_map: parentObj.parent_wbs_status_map,
      wbs_status: parentObj.parent_wbs_status,
    });
    if (
      !_workItemTypeKey[
        parentObj.parent_work_item_type_key || curWorkItemTypeKey
      ]
    ) {
      _workItemTypeKey[
        parentObj.parent_work_item_type_key || curWorkItemTypeKey
      ] = 1;
    }
    // children是可选字段
    if ("sub_work_item" in item) {
      if (Array.isArray(item.sub_work_item)) {
        item.sub_work_item?.forEach((child) => {
          // 子节点的可用类型键：优先父节点（当前节点）的，父节点为空则用爷节点的
          const childAvailableTypeKey =
            item.work_item_type_key || grandParentTypeKey;
          // 只有当子节点原本的 work_item_type_key 为空时，才进行赋值（避免覆盖已有值）
          if (!child.work_item_type_key && childAvailableTypeKey) {
            child.work_item_type_key = childAvailableTypeKey;
          }
          recursiveMap(
            child,
            {
              parent_work_item_type_key: childAvailableTypeKey,
              parent_wbs_status_map: item.wbs_status_map,
              parent_wbs_status: item.wbs_status,
            },
            grandParentTypeKey
          );
        });
      }
    }
  };
  lists.forEach((item) => {
    recursiveMap(
      item,
      {
        parent_work_item_type_key:
          item.work_item_type_key || curWorkItemTypeKey,
        parent_wbs_status_map: item.wbs_status_map,
        parent_wbs_status: item.wbs_status,
      },
      item.work_item_type_key
    );
  });
  const groupByLists = _groupBy(flatLists, "wbs_status");
  const _data: Record<string, any> = {};
  for (const item of Object.keys(groupByLists)) {
    const _curList = groupByLists[item].filter((child) => {
      if (
        Array.isArray(child.union_deliverable?.field_deliverables) ||
        Array.isArray(child.union_deliverable?.instance_deliverables)
      ) {
        return true;
      } else {
        return false;
      }
    });
    if (_curList.length) {
      _data[item] = _curList;
    }
  }
  return { data: _data, workItemTypeKey: _workItemTypeKey };
};

export interface IDocuments {
  id: string;
  name: string;
  type: FieldTypeKey;
  value: any;
  originVal?: any;
  options?: { label: string; value: string; text?: string }[];
  optionsMap?: Record<string, any>;
  required?: boolean;
  field_key: FieldTypeKey; // 主要用来识别系统字段
  // 存放人员的userkey
  field_user_value?: string;
  lark_field_key?: string;
  lark_field_name?: string;
  lark_field_type?: string;
}

const createItem = ({ field, getVal, results, i, ...reset }) => ({
  id: field.field_key,
  name: field.field_name,
  type: field.field_type_key,
  value: getVal,
  originVal: results[i],
  ...reset,
  ...field,
});

const checkTypeMap = (field_type_key) =>
  [
    "business",
    "select",
    "multi_select",
    "radio",
    "tree_select",
    "tree_multi_select",
    "work_item_status",
  ].includes(field_type_key);

export const getUserObj = async (userKeysOrigin) => {
  if (Array.isArray(userKeysOrigin) && userKeysOrigin.length === 0) {
    return {
      getVal: "",
      field_user_value: "",
      userTextList: [],
    };
  }
  let userKeys = [...userKeysOrigin];
  if (!Array.isArray(userKeysOrigin)) {
    userKeys = [userKeysOrigin];
  }
  if (userKeys.some((i) => i.nickname)) {
    return {
      getVal: userKeys.map((i) => i.nickname).join(","),
      field_user_value: userKeys.map((i) => i.username).join(","),
      userTextList: userKeys,
    };
  }
  const res = await fetchUserInfo(userKeys);

  const { err_code, data } = res;
  if (err_code === 0) {
    return {
      getVal: data?.map((i) => i.name_cn).join(","),
      field_user_value: userKeys.join(","),
      userTextList: data?.map((i) => ({
        userKey: i.user_key,
        nickname: i.name_cn,
        avatar: i.avatar_url,
      })),
    };
  }
};

const getRelatedWorkItems = async (
  projectKey: string,
  workObjectId: string,
  idList: number[],
  field_keys: string[] = ["name"]
) => {
  const { err_code, data } = await fetchRelatedWorkItems(
    projectKey,
    workObjectId,
    idList,
    field_keys
  );
  if (err_code === 0) {
    return data;
  }
  return undefined;
};
  

export const getFieldValue = async ({
  requests,
  spaceId,
  fields,
  workObjectId,
  changedField,
}) => {
  let _field_err = "";
  const result: IDocuments[] = [];
  await Promise.all(requests)
    .then(async (results) => {
      for (let i = 0; i < fields.length; i++) {
        let getVal = results[i];
        let optionsMap = {};
        let options = {};
        let originText: string[] | string | undefined = "";
        const { field_type_key, field_key } = fields[i];
        _field_err = fields[i];
        let field_user_value: string | undefined = "";
        let user_text_list: any = [];
        let newItem: IDocuments[] = [];
        if (typeof results[i] !== "undefined" || checkTypeMap(field_type_key)) {
          switch (field_type_key) {
            // 兼容单选按钮,多选按钮,单选,多选
            case "select":
            case "multi_select":
            case "radio": {
              const listMap =
                fields[i].options && getMapByLists(fields[i].options);
              if (results[i]) {
                // 兼容单选results[i]为字符串时，影响includes判断
                let resultsList: string[] = [];
                resultsList = Array.isArray(results[i])
                  ? results[i]
                  : [results[i]];
                originText = fields[i].options?.length
                  ? fields[i].options
                      ?.filter((item) => resultsList.includes(item.value))
                      .map((item) => item.label.trim())
                  : [];
                getVal = (originText as string[]).join(",");
                options = { options: fields[i].options };
              }
              if (listMap) {
                optionsMap = listMap;
              }
              break;
            }
            // 兼容级联单选,级联多选,业务线
            case "business":
            case "tree_select":
            case "tree_multi_select":
              try {
                const listMap =
                  fields[i].options && getMapByLists(fields[i].options);
                if (results[i]) {
                  if (Array.isArray(results[i])) {
                    // 有&前缀表示”仅选中“，没有&前缀表示”选中当前级别和所有子级“。
                    // 仅选本级，本级的子级都不选，只有”父子独立“
                    results[i] = results[i].map((item) =>
                      item.replace(/&/g, "")
                    );
                    originText = results[i].map((item) =>
                      listMap?.[item].label.trim()
                    );
                    getVal = results[i]
                      .map((item) => listMap?.[item]?.display)
                      .join(",");
                  } else {
                    originText = [listMap?.[results[i]]?.label.trim()];
                    getVal = listMap?.[results[i]]?.display;
                  }
                }
                if (listMap) {
                  optionsMap = listMap;
                }
              } catch {
                throw new Error(
                  `Failed FieldKey: ${field_key}; Value:${results[i]}`
                );
              }
              break;
            case "role_owners": {
              const getRoleResult = async (results) => {
                if (Array.isArray(results)) {
                  const roleResultObj = await results.reduce(
                    async (accumulator, current) => {
                      const r = await accumulator;
                      if (current.owners?.[0]?.username) {
                        r[current.role] = {
                          val: current.owners.map((i) => i.nickname).join(","),
                          options: current.owners,
                          field_user_value: current.owners
                            .map((i) => i.username)
                            .join(","),
                        };
                      } else {
                        // 兼容海外获取角色owners格式不一致问题
                        const user = await getUserObj(current.owners);
                        r[current.role] = {
                          val: user?.userTextList
                            ?.map((i) => i.nickname)
                            .join(","),
                          options: user?.userTextList,
                          field_user_value: user?.field_user_value,
                        };
                      }
                      return r;
                    },
                    {}
                  );
                  return roleResultObj;
                }
              };
              const roleList = await getRoleList(spaceId, workObjectId);
              const roleResultObj = await getRoleResult(results[i]);
              if (roleResultObj && Object.keys(roleResultObj)?.length) {
                for (const item of roleList) {
                  newItem.push(
                    createItem({
                      field: {
                        field_key: item.id,
                        field_name: item.name,
                        field_type_key: "role_owners",
                      },
                      getVal: roleResultObj[item.id]?.val ?? "",
                      results,
                      i,
                      options: roleResultObj[item.id]?.options ?? [],
                      optionsMap: roleResultObj,
                      field_user_value:
                        roleResultObj[item.id]?.field_user_value ?? "",
                    })
                  );
                }
              }
              break;
            }
            case "work_item_status": {
              const curStateKey = results[i]?.state_key;
              try {
                const listMap =
                  fields[i].options && getMapByLists(fields[i].options);
                if (curStateKey) {
                  originText = [listMap?.[curStateKey]?.label];
                  getVal = listMap?.[curStateKey]?.display;
                }
                if (listMap) {
                  optionsMap = listMap;
                }
              } catch {
                throw new Error(
                  `Failed WorkItemStatus FieldKey: ${field_key}; Value:${JSON.stringify(
                    results[i]
                  )}`
                );
              }
              break;
            }
            case "work_item_related_select":
            case "work_item_related_multi_select":
              if (results[i]) {
                if (field_key && changedField?.filed_key === field_key) {
                  getVal = results[i];
                } else {
                  const param = Array.isArray(results[i])
                    ? results[i]
                    : [results[i]];
                  const res = await getRelatedWorkItems(spaceId, workObjectId, param, ["name"]);
                  getVal = res?.map((i) => i.name).join(",");
                }
              } else {
                getVal = "";
              }
              break;
            case "multi_user": {
              // 系统字段字段则返回人员对象可能为null和[]
              if (results[i] && Array.isArray(results[i])) {
                const user = await getUserObj(results[i]);
                getVal = user?.getVal;
                field_user_value = user?.field_user_value;
                user_text_list = user?.userTextList;
              }
              break;
            }
            case "user":
              // 兼容openapi取值自定义的字段直接返回人名【通常】，系统字段字段则返回人员对象【ps：创建者】
              if (results[i] && !results[i]?.nickname) {
                const user = await getUserObj(
                  Array.isArray(results[i]) ? results[i] : [results[i]]
                );
                getVal = user?.getVal;
                field_user_value = user?.field_user_value;
                user_text_list = user?.userTextList;
              } else {
                getVal = results[i]?.nickname || "";
                field_user_value = results[i]?.username;
              }
              break;
            case "bool":
              getVal =
                typeof results[i] === "boolean"
                  ? results[i]
                    ? "是"
                    : "否"
                  : "-";
              break;
            case "multi_text":
              // 抹平富文本的val取值
              if (results[i]?.doc_text) {
                getVal = results[i]?.doc_text;
              } else if (typeof results[i] === "string") {
                getVal = results[i];
              } else {
                getVal = "-";
              }
              break;
            case "number":
              getVal = results[i] ?? "";
              break;
            case "file":
              if (Array.isArray(results[i])) {
                getVal = results[i] || "";
              } else {
                getVal = results[i] ? [results[i]] : "";
              }
              break;
            case "schedule":
              if (Array.isArray(results[i])) {
                if (results[i]?.length === 2) {
                  const [startVal, endVal] = results[i];
                  getVal = `${moment(startVal).format("YYYY-MM-DD")} - ${moment(
                    endVal
                  ).format("YYYY-MM-DD")}`;
                }
                if (results[i]?.length === 0) {
                  getVal = "";
                }
              }
              if (results[i]?.start_time && results[i]?.end_time) {
                getVal = `${moment(results[i]?.start_time).format(
                  "YYYY-MM-DD"
                )} - ${moment(results[i]?.end_time).format("YYYY-MM-DD")}`;
              }
              break;
            case "owned_project":
              getVal = results[i]?.name;
              break;
            case "abort_detail":
              getVal = results[i];
              break;
            case "work_item_template":
              if (typeof results[i] === "string") {
                getVal =
                  fields[i]?.options?.find(
                    (opt) => opt.value === String(results[i])
                  )?.label ?? "";
              } else {
                getVal =
                  fields[i]?.options?.find(
                    (opt) => opt.value === String(results[i]?.id)
                  )?.label ?? "";
                originText = [getVal];
              }
              break;
            case "vote_option":
            case "vote_option_multi":
            case "compound_field":
              getVal = "";
              break;
            default:
              // 处理常规的空值
              getVal =
                results[i]?.length === 0 || !results[i] ? "" : results[i];
          }
        } else {
          // 兜底typeof results[i] === 'undefined'，ps:number类型节点流为null，状态流为undefined
          getVal = "";
        }
        newItem =
          newItem.length === 0
            ? [
                createItem({
                  field: fields[i],
                  getVal,
                  results,
                  i,
                  options,
                  optionsMap,
                  field_user_value,
                  originText,
                  user_text_list,
                }),
              ]
            : newItem;
        result.push(...newItem);
      }
    })
    .catch((err) => {
      console.error("获取字段值", err);
      console.error("获取字段值_field_err", _field_err);
    });
  return result;
};