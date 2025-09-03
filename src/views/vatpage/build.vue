<template>
  <n-modal v-model:show="state.editDialogVisible" :on-after-leave="hide">
    <n-card title="构建页面" :style="{width: props.width}">
      <template #header-extra>
        <i class="ifont i-close-circle modal-card-close" @click="hide()"></i>
      </template>
      <n-tabs type="line" style="width: 100%;" v-model:value="state.tab">
        <n-tab-pane name="基本信息">
          <div class="build-height">
            <n-card style="width: 100%;">
              <VatForm formGrid :list="state.baseInfoForm" labelPlacement="left" :bindProps="{'label-width': '80px'}" :gridValue="8" :colsValue="24" v-model="state.data"></VatForm>
<!--              <n-divider></n-divider>-->
              <div class="flex">
                <n-card>
                  <div><div>生成控制器路径：</div>/app/{{state.data.build_app_name}}/controller/{{state.data.build_controller}}Controller.php</div>
                  <div><div>生成模型路径：</div>/app/{{state.data.build_app_name}}/model/{{state.data.build_model}}.php</div>
                  <div><div>生成前端路径：</div>/src/views/{{state.data.build_view}}</div>
                </n-card>
                <n-card>
<pre style="margin: 0;">{{state.tplJson.api_list}}</pre>
                </n-card>
              </div>
            </n-card>
          </div>
        </n-tab-pane>
        <n-tab-pane name="表关联">
          <n-card class="build-height">
            <VatFormTable :columns="state.joinColumns" buildDefault v-model="state.tplJson.joins"></VatFormTable>
            <n-card title="查询字段" size="small">
              <n-input v-model:value="state.tplJson.select_fields" type="textarea" placeholder="请输入查询字段"></n-input>
            </n-card>
          </n-card>
        </n-tab-pane>
        <n-tab-pane name="字段信息">
          <div class="build-height">
            <n-button v-if="formatJoins().length > 0" v-for="item in formatJoins()" :key="item.value" @click="chooseTableField(item)">添加表字段 - {{item.key}}【{{item.value}}】</n-button>
            <n-modal v-model:show="state.joinTablesShow" style="width: 50%;">
              <n-card title="添加表字段">
                <n-data-table
                    v-model:checked-row-keys="state.chooseFields"
                    :columns="[{type: 'selection'},{title:'字段', key:'field'},{title:'说明', key:'comment'}]"
                    :data="state.joinTables"
                    :row-key="(row) => row.field"
                    :pagination="false"
                    striped
                    resizable
                />
                <template #action>
                  <n-button type="primary" @click="chooseTableFieldSure">确认</n-button>
                </template>
              </n-card>
            </n-modal>
            <n-data-table
                :columns="state.columns"
                :data="state.fieldData"
                :pagination="false"
                striped
                resizable
                flex-height
                scroll-x="1800"
                class="build-height"
                style="margin-top: 15px;"
            />
          </div>
        </n-tab-pane>
        <n-tab-pane name="菜单SQL">
          <n-card class="build-height w100">
            <n-code :code="sqlCode()" word-wrap language="sql" style="font-size: 13px;" />
          </n-card>
        </n-tab-pane>
        <n-tab-pane name="JSON数据">
          <n-alert type="warning">
            注意：在本TAB点击提交，只提交基本信息和JSON数据
          </n-alert>
          <div class="flex flex-jc-sb build-height">
            <JsonEditorVue v-model="state.data.tpl_json" v-bind="state.options" style="width: 100%; max-height: 500px; overflow-y: auto;"></JsonEditorVue>
          </div>
        </n-tab-pane>
      </n-tabs>
      <template #action>
        <n-flex justify="end">
          <n-space>
<!--            <n-button type="tertiary" @click="reset()">重置</n-button>-->
            <n-button type="tertiary" @click="hide()">取消</n-button>
            <n-button type="primary" @click="toSubmit()">提交</n-button>
          </n-space>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
import Request from '@/utils/axios'
import {inject} from "vue";
const tools = inject('tools')
import VatForm from "@/components/VatForm.vue";
import VatFormTable from "@/components/VatFormTable.vue";
import pageJsonData from "@/vat/pages/vat_pages.json";
import JsonEditorVue from 'json-editor-vue'
import { NCheckbox, NButton, NInput, NSelect } from 'naive-ui'
const props = defineProps({
  width:{
    type: String,
    default: '50%',
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

let formJson = tools.pages.buildForm(pageJsonData.fields)

const dictMap = ref([])

const state = reactive({
  tab:'基本信息',
  data: {},
  formList: formJson,
  editDialogVisible: props.modelValue,
  cloneSource: {},
  baseInfoForm: [
    {
      label: '表名称',
      field: 'table',
      type: 'input',
      placeholder: '',
      value: '',
      config: {props:{disabled: true}}
    },
    {
      label: '应用名称',
      field: 'build_app_name',
      type: 'input',
      placeholder: '请输入应用名称',
      value: 'admin',
      config: {}
    },
    {
      label: '控制类',
      field: 'build_controller',
      type: 'input',
      placeholder: '请输入控制类名称，不包含Controller',
      value: '',
      config: {}
    },
    {
      label: '模型类',
      field: 'build_model',
      type: 'input',
      placeholder: '请输入模型类名称',
      value: '',
      config: {}
    },
    {
      label: '生成路径',
      field: 'build_view',
      type: 'input',
      placeholder: '请输入前端生成路径，@views/',
      value: '',
      config: {}
    },
    {
      label: '生成菜单',
      field: 'build_menu',
      type: 'cascader',
      placeholder: '请选择菜单，不选默认为顶级菜单',
      value: '',
      config: {options:[]}
    },
    {
      label: '菜单名称',
      field: 'build_menu_name',
      type: 'input',
      placeholder: '',
      value: '',
      config: {}
    },
  ],
  joinColumns:[
    {title:'关联类型', key: 'join',
      render: (row, index) => {
        return h(NSelect, {
          options: [
            {label: 'INNER JOIN', value: 'INNER JOIN'},
            {label: 'LEFT JOIN', value: 'LEFT JOIN'},
            {label: 'RIGHT JOIN', value: 'RIGHT JOIN'},
          ],
          style:"min-width:130px;",
          clearable: true,
          value: row.join,
          'on-update:value': (val) => {
            state.tplJson.joins[index] = { ...state.tplJson.joins[index], join: val };
          },
        })
      }
    },
    {title:'关联表名', key: 'table'},
    {title:'别名', key: 'alias'},
    {title:'关联ON', key: 'on'}
  ],
  columns:[
    {title:'字段', key:'field', width:150, fixed:'left'},
    {title:'字段别名', key:'alias', width:100,
      render:(row, index) => {
        return h(NInput, {
          size: 'small',
          value: row.alias,
          onUpdateValue: (val) => {
            state.fieldData[index].alias = val
          },
        })
      }
    },
    {title:'表别名', key:'table_alias', width:100, render:(row, index) => {
        return h(NSelect, {
          options: formatJoins(state.data.joins),
          size: 'small',
          clearable: true,
          value: row.table_alias,
          'on-update:value': (val) => {
            state.fieldData[index].table_alias = val
          },
        })
      }
    },
    {title:'字段说明', key:'comment',  width:100,
      render:(row, index) => {
        return h(NInput, {
          size: 'small',
          value: row.comment,
          onUpdateValue: (val) => {
            state.fieldData[index].comment = val
          },
        })
      }
    },
    {title:'类型', key:'type', width:120},
    {title:'宽度', key:'width',  width:100,
      render:(row, index) => {
        return h(NInput, {
          type: 'number',
          size: 'small',
          value: row.width + '',
          onUpdateValue: (val) => {
            state.fieldData[index].width = val
          },
        })
      }
    },
    {title:'查询', key:'search', width:60,
      render:(row, index) => {
        return h(NCheckbox, {
          'default-checked': row.search,
          'on-update:checked': (val) => {
            state.fieldData[index].search = val
          },
        })
      }
    },
    {title:'列表', key:'table_column', width:60,
      render:(row, index) => {
        return h(NCheckbox, {
          'default-checked': row.table_column,
          'on-update:checked': (val) => {
            state.fieldData[index].table_column = val
          },
        })
      }
    },
    {title:'表单', key:'form', width:60,
      render:(row, index) => {
        return h(NCheckbox, {
          'default-checked': row.form,
          'on-update:checked': (val) => {
            state.fieldData[index].form = val
          },
        })
      }
    },
    {title:'必填', key:'form_required', width:60,
      render:(row, index) => {
        return h(NCheckbox, {
          'default-checked': row.form_required,
          'on-update:checked': (val) => {
            state.fieldData[index].form_required = val
          },
        })
      }
    },
    {title:'排序', key:'sorter', width:60,
      render:(row, index) => {
        return h(NCheckbox, {
          'default-checked': row.sorter,
          'on-update:checked': (val) => {
            state.fieldData[index].sorter = val
          },
        })
      }
    },
    {title:'条件', key:'condition', width: 150,
      render:(row, index) => {
        return h(NSelect, {
          options: [
            {label: '=', value: '='},
            {label: '!=', value: '!='},
            {label: '>', value: '>'},
            {label: '>=', value: '>='},
            {label: '<', value: '<'},
            {label: '<=', value: '<='},
            {label: 'LIKE', value: 'like'},
            {label: '左LIKE', value: 'll'},
            {label: '右LIKE', value: 'rl'},
            {label: 'IN', value: 'in'},
            {label: 'NOT IN', value: 'notin'},
            {label: 'BETWEEN', value: 'between'},
            {label: '自然语言全文搜索', value: 'match_against'},
            {label: '布尔全文搜索', value: 'match_against_mode'},
          ],
          size: 'small',
          value: row.condition,
          'on-update:value': (val) => {
            state.fieldData[index].condition = val
          },
        })
      }
    },
    {title:'查询控件', key:'search_view', width: 150,
      render:(row, index) => {
        return h('div', {}, {default: () => {
          return [
            h(NSelect, {
              options: [
                {label: '输入框', value: 'input'},
                {label: '区间框', value: 'input-pair'},
                {label: '下拉框', value: 'select'},
                {label: '时间选择器', value: 'datepicker'},
                {label: '级联选择器', value: 'cascader'},
              ],
              size: 'small',
              clearable: true,
              value: row.search_view,
              'on-update:value': (val) => {
                state.fieldData[index].search_view = val
              },
            }),
            h(NSelect, {
              options: [
                {label: '年度', value: 'year'},
                {label: '年度范围', value: 'yearrange'},
                {label: '季度', value: 'quarter'},
                {label: '季度范围', value: 'quarterrange'},
                {label: '月度', value: 'month'},
                {label: '月度范围', value: 'monthrange'},
                {label: '周', value: 'week'},
                {label: '日期', value: 'date'},
                {label: '日期范围', value: 'daterange'},
                {label: '时间', value: 'datetime'},
                {label: '时间范围', value: 'datetimerange'},

              ],
              size: 'small',
              style: row.search_view === 'datepicker' ? '' : 'display: none',
              clearable: true,
              value: row.config.type,
              'on-update:value': (val) => {
                state.fieldData[index].config = { ...state.fieldData[index].config, type: val }
              },
            })
          ]
        }})
      }
    },
    {title:'表单控件', key:'form_view', width: 150,
      render:(row, index) => {
        return h('div', {}, {default: () => {
            return [
              h(NSelect, {
                options: [
                  {label: '输入框', value: 'input'},
                  {label: '数字框', value: 'input_number'},
                  {label: '密码框', value: 'password'},
                  {label: '文本域', value: 'textarea'},
                  {label: '下拉框', value: 'select'},
                  {label: '开关', value: 'switch'},
                  {label: '单选框', value: 'radio'},
                  {label: '复选框', value: 'checkbox'},
                  {label: '时间选择器', value: 'datepicker'},
                  {label: '级联选择器', value: 'cascader'},
                  {label: '树形选择器', value: 'treeselect'},
                  {label: '字典选择器', value: 'dict'},
                  {label: 'JSON编辑器', value: 'json_editor'},
                  {label: '富文本编辑器', value: 'editor'},
                  {label: '图片上传', value: 'upload'},
                ],
                size: 'small',
                clearable: true,
                value: row.form_view,
                'on-update:value': (val) => {
                  state.fieldData[index].form_view = val
                },
              }),
              h(NSelect, {
                options: [
                  {label: '年度', value: 'year'},
                  {label: '年度范围', value: 'yearrange'},
                  {label: '季度', value: 'quarter'},
                  {label: '季度范围', value: 'quarterrange'},
                  {label: '月度', value: 'month'},
                  {label: '月度范围', value: 'monthrange'},
                  {label: '周', value: 'week'},
                  {label: '日期', value: 'date'},
                  {label: '日期范围', value: 'daterange'},
                  {label: '时间', value: 'datetime'},
                  {label: '时间范围', value: 'datetimerange'},

                ],
                size: 'small',
                style: row.form_view === 'datepicker' ? '' : 'display: none',
                clearable: true,
                value: row.config.form_type,
                'on-update:value': (val) => {
                  state.fieldData[index].config = { ...state.fieldData[index].config, form_type: val }
                },
              })
            ]
          }})
      }
    },
    {title:'数据字典', key:'config.dict', width: 150,
      render:(row, index) => {
        return h(NSelect, {
          options: dictMap.value,
          clearable: true,
          size: 'small',
          disabled: !(['select', 'radio', 'checkbox', 'switch', 'dict'].includes(row.search_view) || ['select', 'radio', 'checkbox', 'switch', 'dict'].includes(row.form_view)),
          value: row.config.dict,
          'on-update:value': (val) => {
            state.fieldData[index].config = { ...state.fieldData[index].config, dict: val }
          },
        })
      }
    },
    {title:'列表顺序', key:'table_order', width: 100,
      render:(row, index) => {
        return h(NInput, {
          type:'number',
          size: 'small',
          value: row.table_order + '',
          onUpdateValue: (val) => {
            state.fieldData[index].table_order = val
          },
        })
      }
    },
    {title:'表单顺序', key:'form_order',  width: 100,
      render:(row, index) => {
        return h(NInput, {
          type:'number',
          size: 'small',
          value: row.form_order + '',
          onUpdateValue: (val) => {
            state.fieldData[index].form_order = val
          },
        })
      }
    },
  ],
  joinTablesShow:false,
  joinTables:[],
  fieldData:[],
  chooseFields:[], //选择字段
  curJoinTable:{},
  tplJson:{},
  options: {
    mode: 'text',  // 默认模式：代码模式
    navigationBar: false, // 默认隐藏导航栏
    mainMenuBar: true,
    flattenColumns: false,
    stringified: true,
    onChange:(val) => {
      // state.value = JSON.stringify(JSON.parse(val.text));
      // console.log('state.value',state.value);
    }
  },
  code: ""
})

function sqlCode(){
  const { table, build_menu, build_menu_name, build_view, build_app_name, build_controller } = state.data;

  let code = `
-- 生成菜单
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (${build_menu || 0}, '${build_menu_name}', '${build_view}', '${build_view}/index', 'list', 0, 'menu', 1, '');
SET @id := LAST_INSERT_ID();
-- 菜单权限块
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '列表', '${table}_list', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/list');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '添加', '${table}_add', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/edit');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '编辑', '${table}_edit', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/edit');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '锁定', '${table}_lock', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/lock');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '解锁', '${table}_unlock', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/lock');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '删除', '${table}_delete', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/delete');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '导入', '${table}_import', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/import*');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '下载', '${table}_download', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/download*');
INSERT INTO \`vat_admin_menu\`(\`parent_id\`, \`name\`, \`path\`, \`component\`, \`icon\`, \`hidden\`, \`type\`, \`is_permission\`, \`permission_route\`)
VALUES (@id, '批量操作', '${table}_batch', '', '', 1, 'button', 1, '/${build_app_name}/${build_controller}/batch*');
  `;
  state.code = code
  return code;
}

function initData(){
  let data = {id: 0, tpl_json: ''}
  state.baseInfoForm.forEach((v) => {
    data[v.field] = v.value
  })
  state.data = data
}
initData()

/**
 * 获取菜单
 */
function getMenus(){
  Request.request(pageJsonData.api_list.menus, {}).then(res => {
    state.baseInfoForm[5].config.options = res.data.list
  }).catch(err => {
    console.log(err)
  })
}
getMenus()


/**
 * 获取字典
 */
function getDict(){
  Request.request(pageJsonData.api_list.dict, {}).then(res => {
    dictMap.value = res.data.list
  }).catch(err => {
    console.log(err)
  })
}
getDict()

/**
 * 格式化joins为select数据格式
 */
function formatJoins(){
  let joinSelect = []
  state.tplJson.joins.forEach((v) => {
    if(v.table && v.alias && v.join && v.on){
      joinSelect.push({
        key: v.table,
        label: v.alias,
        value: v.alias,
      })
    }
  })
  return joinSelect
}

/**
 * 选择表字段
 */
function chooseTableField(val){
  state.curJoinTable = val
  //获取表字段
  Request.request(pageJsonData.api_list.fields, {table: val.key}).then(res => {
    state.joinTables = res.data.list
  }).catch(err => {
    console.log(err)
  })
  state.joinTablesShow = true
}

function chooseTableFieldSure(){
  let addData = state.joinTables.filter((item) => state.chooseFields.includes(item.field))
  console.log(addData)
  if(addData){
    addData.forEach((row) => {
      row.table_alias = state.curJoinTable.value
      if(state.fieldData.some(item => item.field === row.field && item.table_alias === row.table_alias) ){
        tools.notice.message.error('字段 '+row.field+' 已存在')
      }else{
        state.fieldData.push(row)
      }
    })
  }
  state.joinTablesShow = false
}

/**
 * "list": {"url": "/admin/system/user/list", "method": "get"},
 * "edit": {"url": "/admin/system/user/edit", "method": "post"},
 * "lock": {"url": "/admin/system/user/lock", "method": "post"},
 * "delete": {"url": "/admin/system/user/delete", "method": "post"},
 * "import": {"url": "/admin/system/user/import", "method": "post"},
 * "download": {"url": "/admin/system/user/download", "method": "post"}
 */
function formatApiList(){
  state.tplJson.api_list = Object.assign({}, state.tplJson.api_list, {
    list: {url: '/'+ state.data.build_app_name + '/' + state.data.build_controller + '/list', method: 'get'},
    edit: {url: '/'+ state.data.build_app_name + '/' + state.data.build_controller + '/edit', method: 'post'},
    lock: {url: '/'+ state.data.build_app_name + '/' + state.data.build_controller + '/lock', method: 'post'},
    delete: {url: '/'+ state.data.build_app_name + '/' + state.data.build_controller + '/delete', method: 'post'},
    import: {url: '/'+ state.data.build_app_name + '/' + state.data.build_controller + '/import', method: 'post'},
    download: {url: '/'+ state.data.build_app_name + '/' + state.data.build_controller + '/download', method: 'get'},
  })
}


function fieldData(){
  let tplJson = JSON.parse(state.data.tpl_json)
  state.tplJson = tplJson
  state.fieldData = tplJson.fields
}

const emits = defineEmits(['update:modelValue', 'change', 'submit'])

/**
 * 展示
 */
function show(){
  state.editDialogVisible = true
  emits('update:modelValue', true)
  emits('change', true)
}

/**
 * 隐藏
 */
function hide(){
  state.editDialogVisible = false
  emits('update:modelValue', false)
  emits('change', false)
}

/**
 * 重置
 */
function reset(){
  if(state.data.id){
    state.data = JSON.parse(JSON.stringify(state.cloneSource))
  }else{
    initData()
  }
}


/**
 * 注入数据
 * @param row
 */
function injectData(row){
  state.data = tools.pages.mergeObjects(state.data, row)
  state.cloneSource = JSON.parse(JSON.stringify(state.data))
  fieldData()
  console.log(state.data)
}

/**
 * 提交
 */
function toSubmit(){
  if(state.tab !== 'JSON数据'){
    state.tplJson.joins = state.tplJson.joins.filter((item) => item.table && item.alias && item.join && item.on)
    state.tplJson.fields = state.fieldData
    state.data.tpl_json = JSON.stringify(state.tplJson)
  }
  Request.request(pageJsonData.api_list.edit, state.data).then(res => {
    tools.notice.message.success(res.msg)
    hide()
    emits('submit')
  }).catch(err => {
    console.log(err)
  })
}

watch(() => props.modelValue, (val) => {
  state.editDialogVisible = val
  if(!val){
    initData()
  }
})

watch(() => [state.data.build_app_name, state.data.build_controller], (val) => {
  formatApiList()
}, {immediate: true, deep: true})

defineExpose({
  injectData,
  show,
  hide,
  state
})
</script>
<style scoped>
.build-height{
  height: 500px;
  overflow-y: auto
}
</style>