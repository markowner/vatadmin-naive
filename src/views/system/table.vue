<template>
  <n-form-item>
    <n-input v-model:value="state.query.filter" placeholder="请输入表名或名称"></n-input>
  </n-form-item>
  <n-data-table
      :bordered="false"
      :columns="state.columns"
      :data="filteredData"
  />
</template>
<script setup>
  import Request from '@/utils/axios'
  import { inject } from "vue";
  const api = inject('api')
  const tools = inject('tools')
  const state = reactive({
    query: {
      filter: ''
    },
    list: [],
    columns: [
      {
        title: '表名',
        key: 'table'
      },
      {
        title: '注释',
        key: 'comment'
      },
      {
        title: '生成页面',
        key: 'is_page',
        render: (row) => {
          return tools.pages.renderTextColor([1,0,0,0,0], row.is_page, row.is_page == 1 ? '已生成' : '未生成')
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (row) => {
          let info = {
            label: '生成页面',
            type: 'primary'
          }
          if(row.is_page === 1){
            info.label = '重新生成'
            info.type = 'success'
          }
          return tools.pages.renderButton(info.label,info.type, () => {
            Request.request(api.api_list.tables.createPage, {table: row.table}).then((res) => {
              tools.notice.message.success(res.msg)
            })
          })
        }
      }
    ]
  })

  //获取数据
  function getList(){
    Request.request(api.api_list.tables.list, state.query).then(res => {
      state.list = res.data.list
    }).catch(err => {
      console.log(err)
    })
  }

  getList()

  /**
   * 过滤数据
   * @type {ComputedRef<UnwrapRefSimple<*>[]|Array<UnwrapRefSimple<*>>>}
   */
  const filteredData = computed(() => {
    if(state.query.filter){
      return state.list.filter(item => {
        return (
            item.table.includes(state.query.filter) ||
            item.comment.includes(state.query.filter)
        )
      })
    }else{
      return state.list
    }
  })

</script>
<style scoped>

</style>