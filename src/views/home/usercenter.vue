<template>
  <n-card size="small">
    <n-tabs
        v-model:value="state.tab"
        class="card-tabs"
        size="small"
        animated
        type="line"
    >
      <n-tab-pane name="user" tab="个人资料">
        <n-form size="medium" style="margin: 10px 0;" label-placement="left" label-width="80">
          <n-form-item-row label="账号" path="username">
            <n-input v-model:value="state.form.username" disabled />
          </n-form-item-row>
          <n-form-item-row label="名称" path="name" required require-mark-placement="left">
            <n-input v-model:value="state.form.name" />
          </n-form-item-row>
          <n-form-item-row label="手机号" path="mobile">
            <n-input v-model:value="state.form.mobile" />
          </n-form-item-row>
          <n-form-item-row label="邮箱" path="email">
            <n-input v-model:value="state.form.email" />
          </n-form-item-row>
          <n-form-item-row label="头像" path="avatar">
            <VatUpload v-model="state.form.avatar" :configProps="{'list-type': 'image-card','max': 1}"></VatUpload>
          </n-form-item-row>
        </n-form>

      </n-tab-pane>
      <n-tab-pane name="changePwd" tab="安全设置">
        <n-form size="medium" ref="myForm" :model="state.form1" :rules="state.rules" style="margin: 10px 0;" label-placement="left" label-width="80">
          <n-form-item-row label="旧密码" path="password_old">
            <n-input type="password" autocomplete="" placeholder="请输入旧密码" v-model:value="state.form1.password_old" />
          </n-form-item-row>
          <n-form-item-row label="新密码" path="password_new">
            <n-input type="password" autocomplete="" placeholder="请输入新密码" v-model:value="state.form1.password_new" />
          </n-form-item-row>
          <n-form-item-row label=" "><n-alert type="warning" style="width: 100%;" :show-icon="false">密码必须同时 包含大写字母、小写字母和数字，且不小于8位</n-alert></n-form-item-row>
          <n-form-item-row label="确认密码" path="password_sure">
            <n-input type="password" autocomplete="" placeholder="请输入确认密码" v-model:value="state.form1.password_sure" />
          </n-form-item-row>
        </n-form>
      </n-tab-pane>
    </n-tabs>
    <template #action>
      <n-button type="primary" size="small" @click="toSubmit">保存设置</n-button>
    </template>
  </n-card>
</template>

<script setup>
import {inject, ref} from "vue";
import {NButton} from "naive-ui";
import Request from '@/utils/axios'
import VatUpload from "@/components/VatUpload.vue";
import VatApi from '@/vat/vat_api.json'
const tools = inject('tools')
const userStore = tools.data.get('Vat-User')

const state = reactive({
  tab: 'user',
  form: {
    username: userStore.username,
    mobile: userStore.mobile,
    name: userStore.name,
    email: userStore.email,
    avatar: userStore.avatar,
  },
  form1: {
    password_old: '',
    password_new: '',
    password_sure: '',
  },
  rules: {
    password_old: {
      required: true,
      trigger: 'blur',
      message: '请输入旧密码'
    },
    password_new: {
      required: true,
      trigger: 'blur',
      message: '请输入新密码'
    },
    password_sure: {
      required: true,
      trigger: 'blur',
      message: '请输入确认密码'
    },
  }
})

const myForm = ref(null)

function toSubmit(e){
  e.preventDefault()
  if(state.tab === 'user'){
    Request.request(VatApi.api_list.userEdit, state.form).then(res => {
      tools.data.set('Vat-User', res.data)
      tools.notice.message.success(res.msg)
    }).catch((err) => {
      console.log(err)
    })
  }else{
    myForm.value?.validate((valid) => {
      if (!valid) {
        Request.request(VatApi.api_list.userEditPassword, state.form1).then(res => {
          tools.notice.message.success(res.msg)
        }).catch((err) => {
          console.log(err)
        })
      }
    })
  }
}
</script>