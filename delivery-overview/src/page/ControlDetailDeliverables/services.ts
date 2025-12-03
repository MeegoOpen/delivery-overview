import { limitGet } from "../../api/request";

/**
 * 
 * 获取工作项关系列表
 * @param payload 空间id（project_key）
 * @returns @IRelationItem
 */
export const fetchDeliverList = async (payload: {
  project_key: string;
  work_item_type_key: string;
  work_item_id: number;
}) =>
  limitGet<unknown, { data?: { data?: any[] } }>(
    `/open_api/${payload.project_key}/work_item/${payload.work_item_type_key}/${payload.work_item_id}/wbs_view`,
    {
      params: {
          need_union_deliverable: true,
      },
    }
  ).then((res) => res.data);
