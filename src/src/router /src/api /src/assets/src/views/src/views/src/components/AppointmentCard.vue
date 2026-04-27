<template>
  <div class="card">
    <div class="card-header">
      <span class="date">{{ formatDate(appointment.appointment_date) }} {{ appointment.appointment_time?.slice(0, 5) }}</span>
      <span :class="['status', appointment.status]">{{ statusText }}</span>
    </div>
    <div class="card-body">
      <p><strong>{{ appointment.customer_name }}</strong> {{ maskPhone(appointment.customer_phone) }}</p>
      <p>项目：{{ appointment.service_type }}</p>
      <p v-if="appointment.notes">备注：{{ appointment.notes }}</p>
    </div>
    <div class="card-actions">
      <van-button size="small" @click="$emit('edit', appointment)">修改</van-button>
      <van-button size="small" type="danger" @click="$emit('delete', appointment)">删除</van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['appointment'])
defineEmits(['edit', 'delete'])

const statusText = computed(() => 
  props.appointment.status === 'completed' ? '已完成' : '待服务'
)

function formatDate(date) {
  return date?.replace(/-/g, '/').slice(5) || ''
}

function maskPhone(phone) {
  return phone ? phone.slice(0, 3) + ' ****' + phone.slice(-4) : ''
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.date {
  font-weight: bold;
}
.status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}
.status.scheduled {
  background: #fff3e0;
  color: #f57c00;
}
.status.completed {
  background: #e8f5e9;
  color: #4caf50;
}
.card-body p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}
.card-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
</style>
