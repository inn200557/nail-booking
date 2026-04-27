<template>
  <div class="customer-page">
    <div class="header">
      <h1>💅 美甲预约</h1>
      <p>选择时间，轻松预约</p>
    </div>

    <van-cell-group inset>
      <van-field label="选择美甲师" />
      <div class="technician-list">
        <div 
          v-for="tech in technicians" 
          :key="tech.id"
          :class="['tech-card', { active: selectedTech?.id === tech.id }]"
          @click="selectedTech = tech"
        >
          <div class="avatar">💅</div>
          <div class="name">{{ tech.name }}</div>
        </div>
      </div>
    </van-cell-group>

    <van-cell-group inset style="margin-top: 12px;">
      <van-field 
        v-model="selectedDate"
        label="选择日期"
        readonly
        @click="showCalendar = true"
      />
      <van-calendar v-model:show="showCalendar" :min-date="minDate" :max-date="maxDate" @confirm="onDateConfirm" />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 12px;" v-if="selectedTech && selectedDate">
      <van-field label="选择时间段" />
      <div class="time-grid">
        <div 
          v-for="slot in timeSlots" 
          :key="slot.time"
          :class="['time-slot', { booked: slot.booked, selected: selectedTime === slot.time }]"
          @click="selectTimeSlot(slot)"
        >
          {{ slot.time }}
        </div>
      </div>
      <p class="legend">🟢 可预约 🔴 已预约</p>
    </van-cell-group>

    <van-cell-group inset style="margin-top: 12px;" v-if="selectedTime">
      <van-field v-model="form.name" label="姓名" placeholder="请输入姓名" />
      <van-field v-model="form.phone" label="电话" placeholder="请输入手机号" />
      <van-field 
        v-model="form.service" 
        label="项目" 
        readonly
        @click="showServices = true"
      />
      <van-action-sheet v-model:show="showServices" :actions="serviceActions" @select="onServiceSelect" />
      <van-field v-model="form.notes" label="备注" placeholder="选填" />
    </van-cell-group>

    <div class="submit-btn" v-if="selectedTime">
      <van-button type="primary" block @click="submitBooking">提交预约</van-button>
    </div>

    <van-dialog v-model:show="showSuccess" title="预约成功" :show-confirm-button="false">
      <div class="success-content">
        <p>✅ 预约已提交</p>
        <p>请按时到店</p>
        <van-button type="primary" size="small" @click="resetForm">确定</van-button>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { showToast } from 'vant'
import { getTechnicians, getServices, getAppointments, createAppointment } from '../api/supabase'

const technicians = ref([])
const services = ref([])
const selectedTech = ref(null)
const selectedDate = ref('')
const selectedTime = ref(null)
const showCalendar = ref(false)
const showServices = ref(false)
const showSuccess = ref(false)
const bookedSlots = ref([])

const form = ref({ name: '', phone: '', service: '', notes: '' })

const minDate = new Date()
const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

const timeSlots = computed(() => {
  const slots = []
  for (let h = 10; h <= 20; h++) {
    slots.push({ time: `${h}:00`, booked: bookedSlots.value.includes(`${h}:00`) })
    if (h < 20) slots.push({ time: `${h}:30`, booked: bookedSlots.value.includes(`${h}:30`) })
  }
  return slots
})

const serviceActions = computed(() => 
  services.value.map(s => ({ name: s.name, value: s.name }))
)

onMounted(async () => {
  technicians.value = await getTechnicians()
  services.value = await getServices()
})

watch([selectedTech, selectedDate], async ([tech, date]) => {
  if (tech && date) {
    const appointments = await getAppointments(date, tech.id)
    bookedSlots.value = appointments.map(a => a.appointment_time.slice(0, 5))
  }
})

function onDateConfirm(val) {
  selectedDate.value = `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`
  showCalendar.value = false
}

function selectTimeSlot(slot) {
  if (slot.booked) {
    showToast('该时段已被预约')
    return
  }
  selectedTime.value = slot.time
}

function onServiceSelect(action) {
  form.value.service = action.name
  showServices.value = false
}

async function submitBooking() {
  if (!form.value.name || !form.value.phone || !form.value.service) {
    showToast('请填写完整信息')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  await createAppointment({
    customer_name: form.value.name,
    customer_phone: form.value.phone,
    technician_id: selectedTech.value.id,
    service_type: form.value.service,
    appointment_date: selectedDate.value,
    appointment_time: selectedTime.value + ':00',
    notes: form.value.notes,
    status: 'scheduled'
  })

  showSuccess.value = true
}

function resetForm() {
  showSuccess.value = false
  selectedTime.value = null
  form.value = { name: '', phone: '', service: '', notes: '' }
  bookedSlots.value = []
}
</script>
<style scoped>
.customer-page {
  padding: 16px;
  padding-bottom: 80px;
}
.header {
  text-align: center;
  padding: 20px 0;
}
.header h1 {
  margin: 0;
  font-size: 24px;
}
.header p {
  margin: 8px 0 0;
  color: #666;
}
.technician-list {
  display: flex;
  gap: 12px;
  padding: 12px;
}
.tech-card {
  flex: 1;
  text-align: center;
  padding: 16px 8px;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px solid transparent;
}
.tech-card.active {
  border-color: #1989fa;
  background: #e8f4ff;
}
.avatar {
  font-size: 32px;
}
.name {
  margin-top: 8px;
  font-size: 14px;
}
.time-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
}
.time-slot {
  text-align: center;
  padding: 10px 0;
  background: #e8ffe8;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
}
.time-slot.booked {
  background: #ffe8e8;
  color: #999;
}
.time-slot.sel
