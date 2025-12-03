/* eslint-disable max-lines-per-function */
import React, {
  useState,
  useEffect,
} from "react";
import { Collapse, Tag, Spin } from "@douyinfe/semi-ui";
import {
  IconSmallTriangleDown,
  IconSmallTriangleRight,
} from "@douyinfe/semi-icons";
import Table from "./Table";
import sdk from "../../utils/sdk";
import { fetchDeliverList } from "./services";
import { getFlatLists } from "./utils";
import { getSelectNewColor } from "./Table/constants";
import "./index.less";
import { fetchWorkObjectFields2, formatFields } from "../../api/services";

const DisplayComp = (props) => {
  const [controlCtx, setControlCtx] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [curActiveKey, setCurActiveKey] = useState<string[]>([]);
  const [flatList, setFlatList] = useState<Record<string, any>>({});
  // const [allFields, setAllFields] = useState<NewWorkObjectField[]>([]);
  const [allFieldsObj, setAllFieldsObj] = useState<any>({});
  const [allFieldsObj2, setAllFieldsObj2] = useState<any>({});
  const [workObjectIds, setWorkObjectIds] = useState<string[]>([]);

  useEffect(() => {
    sdk?.control?.getContext().then((_controlCtx) => {
      setControlCtx(_controlCtx);
    });
    // sdk取字段列表
  }, []);
  useEffect(() => {
    if (workObjectIds.length === 0) {
      return;
    }
    const { workObjectId, spaceId, _workItemId } = controlCtx;
    Promise.all(
      workObjectIds.map((item) =>
        fetchWorkObjectFields2(spaceId, item || workObjectId, false)
      )
    ).then((res) => {
      // const _allFields = res.map((item) => formatFields(item.data));
      let _allFieldsObj = {};
      const _allFieldsObj2 = {};
      res.forEach((item, idx) => {
        const _allFields = formatFields(item.data);
        _allFields.forEach((i) => {
          _allFieldsObj[`${workObjectIds[idx]}$${i.field_key}`] = i.field_name;
        });
        if (!_allFieldsObj2[workObjectIds[idx]]) {
          _allFieldsObj2[workObjectIds[idx]] = _allFields;
        }
      });
      setAllFieldsObj2(_allFieldsObj2);
      setAllFieldsObj(_allFieldsObj);
    });
  }, [workObjectIds]);
  useEffect(() => {
    if (!controlCtx?.workItemId) {
      return;
    }
    const { workObjectId, spaceId, workItemId } = controlCtx;
    setLoading(true);
    fetchDeliverList({
      project_key: spaceId,
      work_item_id: workItemId,
      work_item_type_key: workObjectId,
    }).then((res: any) => {
      const { data: flatList, workItemTypeKey } = getFlatLists(
        res?.related_sub_work_items,
        workObjectId,
      );
      setFlatList(flatList);
      setWorkObjectIds(Object.keys(workItemTypeKey));
    }).finally(() => {
      setLoading(false);
    });
  }, [controlCtx?.workItemId]);

  useEffect(() => {
    const len = Object.keys(flatList).length;
    if (len === 0) {
      return;
    }
    const _curActiveKey = Array.from({ length: len }, (_, i) => `group${i}`);
    setCurActiveKey(_curActiveKey);
  }, [flatList]);

  const renderTable = (list, _allFieldsObj) => {
    // 有所属状态将field_deliverables、instance_deliverables各自聚合
    const field_deliverables: any[] = [];
    const instance_deliverables: any[] = [];
    const _ownersList: string[] = [];

    if (list) {
      list.forEach((element) => {
        if (
          element?.union_deliverable.field_deliverables &&
          Array.isArray(element?.union_deliverable.field_deliverables)
        ) {
          field_deliverables.push(
            ...element?.union_deliverable.field_deliverables.map((i) => ({
              ...i,
              workObjectId:
                element?.parent_work_item_type_key || controlCtx?.workObjectId,
            }))
          );
        }
        if (
          element?.union_deliverable.instance_deliverables &&
          Array.isArray(element?.union_deliverable.instance_deliverables)
        ) {
          instance_deliverables.push(
            ...element?.union_deliverable.instance_deliverables
          );
          element?.union_deliverable.instance_deliverables.forEach((item) => {
            if (Array.isArray(item.owners) && item.owners.length > 0) {
              item.owners.forEach((i) => {
                if (!_ownersList.includes(i)) {
                  _ownersList.push(i);
                }
              });
            }
          });
        }
      });
    }

    if (field_deliverables.length > 0) {
      return (
        <Table
          data={field_deliverables.map((item: any) => {
            return {
              fieldName:
                _allFieldsObj[
                `${item.workObjectId}$${item.field_info.field_key}`
                ],
              field_key: item.field_info.field_key,
              type: item.field_info.field_type_key,
              status: item.status ?? item.state_name, // state_name为字段交付物的实例状态
              remark: item.remark,
              fieldValue: item.field_info.field_value,
              workObjectId: item.workObjectId,
              field_type_key: item.field_info.field_type_key,
              field_key_unikey: `${item.workObjectId}$${item.field_info.field_key}`,
            };
          })}
          columns={[
            {
              title: "字段交付物",
              dataIndex: "fieldName",
              col: 5,
            },
            {
              title: "交付物详情",
              dataIndex: "fieldValue",
              col: 9,
            },
            {
              title: "状态",
              dataIndex: "status",
              col: 4,
            },
            {
              title: "备注",
              dataIndex: "remark",
              col: 6,
            },
          ]}
          style={{
            marginBottom: 12,
          }}
          {...controlCtx}
          allFieldsObj2={allFieldsObj2}
        />
      );
    }
    if (instance_deliverables.length > 0) {
      return (
        <Table
          data={instance_deliverables.map((item: any) => {
            return {
              fieldName: item.name,
              id: item.work_item_id,
              status: item.state_name,
              remark: item.remark,
              fieldValue: item.owners.join(","),
              workObjectId: item.workObjectId,
              type: "instance_deliverable",
            };
          })}
          columns={[
            {
              title: "工作项交付物",
              dataIndex: "fieldName",
              col: 5,
            },
            {
              title: "状态",
              dataIndex: "status",
              col: 4,
            },
            {
              title: "负责人",
              dataIndex: "fieldValue",
              col: 4,
            },
            {
              title: "备注",
              dataIndex: "remark",
              col: 5,
            },
          ]}
          {...controlCtx}
          ownersList={_ownersList}
        />
      );
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="deliver-detail-container">
      {Object.keys(flatList)?.length > 0 ? (
        Object.keys(flatList).map((key, index) => {
          return (
            <Collapse
              clickHeaderToExpand={false}
              collapseIcon={<IconSmallTriangleDown />}
              expandIcon={<IconSmallTriangleRight />}
              keepDOM={true}
              activeKey={curActiveKey}
              onChange={(activeKey) => {
                setCurActiveKey(activeKey as string[]);
              }}
            >
              <Collapse.Panel
                header={
                  <Tag
                    color={getSelectNewColor(index) as any}
                    style={{ margin: "8px 0 8px 10px", fontSize: 14 }}
                  >
                    {key === ""
                      ? "无所属状态"
                      : flatList[key]?.[0].wbs_status_map?.status_name}
                  </Tag>
                }
                itemKey={`group${index}`}
                extra={<div style={{ height: 37, width: "100%" }}></div>}
              >
                {renderTable(flatList[key], allFieldsObj)}
              </Collapse.Panel>
            </Collapse>
          );
        })
      ) : (
        <div style={{ marginTop: 10, marginLeft: 10 }}>暂无数据</div>
      )}
    </div>
  );
};

export default DisplayComp;
