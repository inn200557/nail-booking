<template>
  <div class="admin-page">
    <div v-if="!isLoggedIn" class="login-box">
      <h2>美甲师后台</h2>
      <van-field v-model="password" type="password" label="密码" placeholder="请输入密码" />
      <van-button type="primary" block style="margin-top: 16px;" @click="login">登录</van-button>
    </div>

    <div v-else>
      <div class="header">
        <h2>预约管理</h2>
        <van-button size="small" @click="logout">退出</van-button>
      </div>

      <van-tabs v-model:active="activeTab">
        <van-tab title="今日预约">
          <div class="stats">
            <div class="stat-item">
              <div class="num">{{ todayAppointments.length }}</div>
              <div class="label">今日预约</div>
            </div>
            <div class="stat-item">
              <div class="num">{{ pendingCount }}</div>
              <div class="label">待服务</div>
            </div>
          </div>
          <div class="appointment-list">
            <van-empty v-if="todayAppointments.length === 0" description="暂无预约" />
            <AppointmentCard 
              v-for="apt in todayAppointments" 
              :key="apt.id"
              :appointment="apt"
              @edit="editAppointment"
              @delete="deleteAppointmentHandler"
            />
          </div>
        </van-tab>

        <van-tab title="全部预约">
          <van-cell-group inset style="margin: 12px;">
            <van-field v-model="filterDate" label="日期" placeholder="筛选日期" />
            <van-field 
              v-model="filterTech" 
              label="美甲师" 
              readonly
              @click="showTechFilter = true"
            />
            <van-action-sheet 
              v-model:show="showTechFilter" 
              :actions="techFilterActions" 
              @select="onTechFilterSelect"
            />
          </van-cell-group>
          <div class="appointment-list">
            <van-empty v-if="filteredAppointments.length === 0" description="暂无预约" />
            <AppointmentCard 
              v-for="apt in filteredAppointments" 
              :key="apt.id"
              :appointment="apt"
              @edit="editAppointment"
              @delete="deleteAppointmentHandler"
            />
          </div>
        </van-tab>
      </van-tabs>

      <van-dialog v-model:show="showEdit" title="修改预约" show-cancel-button @confirm="saveEdit">
        <van-cell-group inset>
          <van-field v-model="editForm.customer_name" label="姓名" />
          <van-field v-model="editForm.customer_phone" label="电话" />
          <van-field v-model="editForm.service_type" label="项目" />
          <van-field v-model="editForm.notes" label="备注" />
          <van-field label="状态">
            <template #input>
              <van-radio-group v-model="editForm.status" direction="horizontal">
                <van-radio name="scheduled">待服务</van-radio>
                <van-radio name="completed">已完成</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-cell-group>
      </van-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getTechnicians, getAppointments, updateAppointment, deleteAppointment } from '../api/supabase'
import AppointmentCard from '../components/AppointmentCard.vue'

const password = ref('')
const isLoggedIn = ref(false)
const appointments = ref([])
const technicians = ref([])
const activeTab = ref(0)
const filterDate = ref('')
const filterTech = ref('全部')
const showTechFilter = ref(false)
const showEdit = ref(false)
const editForm = ref({})
const editingId = ref(null)

const ADMIN_PASSWORD = 'admin123'

onMounted(async () => {
  technicians.value = await getTechnicians()
  await loadAppointments()
})

async function loadAppointments() {
  appointments.value = await getAppointments()
}

function login() {
  if (password.value === ADMIN_PASSWORD) {
    isLoggedIn.value = true
    loadAppointments()
  } else {
    showToast('密码错误')
  }
}

function logout() {
  isLoggedIn.value = false
  password.value = ''
}

const today = new Date().toISOString().slice(0, 10)
const todayAppointments = computed(() => 
  appointments.value.filter(a => a.appointment_date === today)
)

const pendingCount = computed(() => 
  todayAppointments.value.filter(a => a.status === 'scheduled').length
)

const techFilterActions = computed(() => [
  { name: '全部', value: '' },
  ...technicians.value.map(t => ({ name: t.name, value: t.id }))
])

function onTechFilterSelect(action) {
  filterTech.value = action.name
  showTechFilter.value = false
}

const filteredAppointments = computed(() => {
  let result = appointments.value
  if (filterDate.value) {
    result = result.filter(a => a.appointment_date === filterDate.value)
  }
  if (filterTech.value !== '全部') {
    const tech = technicians.value.find(t => t.name === filterTech.value)
    if (tech) result = result.filter(a => a.technician_id === tech.id)
  }
  return result
})

function editAppointment(apt) {
  editingId.value = apt.id
  editForm.value = { ...apt }
  showEdit.value = true
}

async function saveEdit() {
  await updateAppointment(editingId.value, editForm.value)
  showToast('修改成功')
  await loadAppointments()
}

async function deleteAppointmentHandler(apt) {
  try {
    await showConfirmDialog({ title: '确认删除', message: '删除后无法恢复，确定删除吗？' })
    await deleteAppointment(apt.id)
    showToast('删除成功')
    await loadAppointments()
  } catch {}
}
</script>
<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.login-box {
  padding: 60px 20px;
}
.login-box h2 {
  text-align: center;
  margin-bottom: 24px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
}
.header h2 {
  margin: 0;
}
.stats {
  display: flex;
  gap: 12px;
  padding: 16px;
}
.stat-item {
  flex: 1;
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
}
.num {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}
.label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
.appointment-list {
  padding: 12px;
}
</style>
