<template>
  <n-layout position="absolute">
    <n-layout-header>
        <div class="flex-shrink">
          <n-flex align="center" style="height: 60px;margin-right: 20px;gap: unset;">
            <div class="flex flex-center" style="width: 80px;text-align: center;height: 100%;"> <img src="@/assets/images/logo.jpeg" style="width: 40px; height: 40px;"></div>
            <n-ellipsis :tooltip="false" style="font-size: 16px;font-weight: bold;">
              【{{ $t('app_name') }} - {{ $t('app_version') }}】安装配置向导
            </n-ellipsis>
          </n-flex>
        </div>
    </n-layout-header>
    <n-layout-content style="padding: 24px">
    <n-card style="max-width: 70%; margin: 20px auto;">
      <n-steps :current="currentStep">
        <n-step title="数据库配置" description="配置数据库连接信息"/>
        <n-step title="完成" description="安装完成"/>
      </n-steps>
      <n-divider />
      <div v-if="currentStep === 1">
        <n-form >
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="数据库主机">
              <n-input v-model:value="dbConfig.host" placeholder="数据库主机"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="数据库端口">
              <n-input v-model:value="dbConfig.port" placeholder="数据库端口"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="账号">
              <n-input v-model:value="dbConfig.user" placeholder="数据库账号"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="密码">
              <n-input v-model:value="dbConfig.password" placeholder="数据库密码"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="数据库名称">
              <n-input v-model:value="dbConfig.database" placeholder="数据库名称"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="数据库表前缀">
              <n-input v-model:value="dbConfig.prefix" placeholder="数据库表前缀"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="数据库字符集">
              <n-input v-model:value="dbConfig.charset" placeholder="数据库字符集"/>
            </n-form-item-gi>
             <n-form-item-gi :span="12" label="数据库排序规则">
              <n-input v-model:value="dbConfig.collation" placeholder="数据库排序规则"/>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <n-button @click="doInstall">下一步</n-button>
      </div>
  
      <div v-if="currentStep === 3">
        <n-result status="success" title="安装成功">
          <template #footer>
            <n-button @click="goToLogin">前往登录</n-button>
          </template>
        </n-result>
      </div>
    </n-card>
    </n-layout-content>
  </n-layout>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import Request from '@/utils/axios'
  const api = inject('api')

  const router = useRouter()
  const currentStep = ref(1)

  const dbConfig = ref({
    host: 'localhost',
    port: '3306',
    database: 'vat',
    user: 'root',
    password: '123456',
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    prefix: '',
  })

  function doInstall(){
    Request.request(api.api_list.installSubmit, {data: dbConfig.value}).then(res => {
      if (res.code === 200) {
        currentStep.value = 3
      }
    }).catch(err => {
      console.log(err)
    })
  }

  function goToLogin(){
    router.push({path: '/login'})
  }
  
  </script>