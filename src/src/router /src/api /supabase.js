import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pannlnwagxnlxjxrikuq.supabase.co'
const supabaseKey = 'sb_publishable_4uB0tj8W3V2PgIqjwp3kZA_d87GYwsb'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getTechnicians() {
  const { data, error } = await supabase.from('technicians').select('*').eq('is_active', true)
  return error ? [] : data
}

export async function getServices() {
  const { data, error } = await supabase.from('services').select('*')
  return error ? [] : data
}

export async function getAppointments(date, technicianId) {
  let query = supabase.from('appointments').select('*')
  if (date) query = query.eq('appointment_date', date)
  if (technicianId) query = query.eq('technician_id', technicianId)
  const { data, error } = await query.order('appointment_date', { ascending: false }).order('appointment_time', { ascending: false })
  return error ? [] : data
}

export async function createAppointment(appointment) {
  const { data, error } = await supabase.from('appointments').insert([appointment]).select()
  return error ? null : data[0]
}

export async function updateAppointment(id, updates) {
  const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select()
  return error ? null : data[0]
}

export async function deleteAppointment(id) {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  return !error
}
