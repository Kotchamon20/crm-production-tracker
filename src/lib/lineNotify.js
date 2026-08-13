// LINE Messaging API Bot Service for Niitan Production Tracker

export const LINE_CHANNEL_ACCESS_TOKEN = 
  import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN || 
  'J00lAX72A/wSSFMXFDlV1l1royQK7zkGWHPAjos/3HsYgS1wSL0qEa7/f93JGyPgzE/5z6PWVRRMuugSOMt9KVx8PsBQmfJ0TGcmB+bx6t15DpkWv6b9jKAHYI22z16vFCtEIpY3G/3X2wFB85TKTgdB04t89/1O/w1cDnyilFU=';

export const LINE_CHANNEL_SECRET = 
  import.meta.env.VITE_LINE_CHANNEL_SECRET || 
  'd908f123a63f362a3dc872faf1177d05';

import { fetchAppSettingFromSupabase } from './supabase';
import { WORKFLOW_STAGES } from '../data/mockData';

export const getStoredGroupId = async () => {
  try {
    const dbSetting = await fetchAppSettingFromSupabase('line_group_id');
    if (dbSetting?.groupId) {
      localStorage.setItem('nitan_line_group_id', dbSetting.groupId);
      return dbSetting.groupId;
    }
  } catch (e) {
    console.warn('Could not fetch line_group_id from Supabase:', e);
  }
  return import.meta.env.VITE_LINE_GROUP_ID || localStorage.getItem('nitan_line_group_id') || 'C3c38541be1266b9f6bd01c327af92491';
};

export const setStoredGroupId = (groupId) => {
  if (groupId) {
    localStorage.setItem('nitan_line_group_id', groupId.trim());
  }
};

/**
 * Build Professional LINE Flex Message Card
 */
export const createFlexMessageCard = (title, job, stageLabel, type = 'update', extraText = '', assignee = '', stageStatus = '', stageDueDate = '') => {
  // Thai status label map
  const statusLabelMap = {
    pending: '⏳ Pending (รอเริ่มงาน)',
    in_progress: '🔵 In Progress (กำลังดำเนินงาน)',
    completed: '✅ Completed (เสร็จสิ้น)',
    delayed: '⚠️ Delayed (ล่าช้ากว่ากำหนด)'
  };
  const statusDisplay = statusLabelMap[stageStatus] || stageStatus || '-';
  // Determine header color by type
  let headerBgColor = '#059669'; // Green (update)
  if (type === 'create') headerBgColor = '#2563eb'; // Blue (create)
  if (type === 'overdue') headerBgColor = '#dc2626'; // Red (overdue)
  if (type === 'reminder') headerBgColor = '#d97706'; // Amber (reminder 1 day)

  return {
    type: 'flex',
    altText: `🔔 [Nitan Tracker] ${title}: ${job.project_name}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: headerBgColor,
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: 'NITAN PRODUCTION TRACKER',
            weight: 'bold',
            color: '#FFFFFF',
            size: 'xs'
          },
          {
            type: 'text',
            text: title,
            weight: 'bold',
            color: '#FFFFFF',
            size: 'lg',
            margin: 'xs'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: job.project_name || 'โครงการผลิตสินค้า',
            weight: 'bold',
            size: 'md',
            wrap: true,
            color: '#1e293b'
          },
          ...(extraText ? [
            {
              type: 'text',
              text: extraText,
              size: 'xs',
              color: type === 'overdue' ? '#dc2626' : '#d97706',
              weight: 'bold',
              margin: 'xs'
            }
          ] : []),
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: 'เลขที่โครงการ',
                size: 'xs',
                color: '#64748b',
                flex: 0
              },
              {
                type: 'text',
                text: job.id,
                size: 'xs',
                color: '#0f172a',
                weight: 'bold',
                align: 'end'
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: 'ขั้นตอนล่าสุด',
                size: 'xs',
                color: '#64748b',
                flex: 0
              },
              {
                type: 'text',
                text: stageLabel || job.current_stage || 'Start',
                size: 'xs',
                color: '#2563eb',
                weight: 'bold',
                align: 'end'
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: 'จำนวนผลิต',
                size: 'xs',
                color: '#64748b',
                flex: 0
              },
              {
                type: 'text',
                text: `${(job.specifications?.quantity || 0).toLocaleString()} ชิ้น`,
                size: 'xs',
                color: '#0f172a',
                align: 'end'
              }
            ]
          },
          ...(stageStatus ? [{
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: 'สถานะขั้นตอน (Status)',
                size: 'xs',
                color: '#64748b',
                flex: 0
              },
              {
                type: 'text',
                text: statusDisplay,
                size: 'xs',
                color: stageStatus === 'completed' ? '#059669' : stageStatus === 'delayed' ? '#dc2626' : stageStatus === 'in_progress' ? '#2563eb' : '#64748b',
                weight: 'bold',
                align: 'end'
              }
            ]
          }] : []),
          ...(stageDueDate ? [{
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: 'กำหนดส่งขั้นตอนนี้',
                size: 'xs',
                color: '#64748b',
                flex: 0
              },
              {
                type: 'text',
                text: stageDueDate,
                size: 'xs',
                color: type === 'overdue' ? '#dc2626' : '#0f172a',
                weight: 'bold',
                align: 'end'
              }
            ]
          }] : []),
          ...(assignee ? [{
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: 'ผู้รับผิดชอบ',
                size: 'xs',
                color: '#64748b',
                flex: 0
              },
              {
                type: 'text',
                text: assignee,
                size: 'xs',
                color: '#7c3aed',
                weight: 'bold',
                align: 'end',
                wrap: true
              }
            ]
          }] : [])
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🤖 Nitan Production Tracker Alert',
            size: 'xxs',
            color: '#94a3b8',
            align: 'center'
          }
        ]
      }
    }
  };
};

/**
 * Send Flex Message or Fallback Text Message to Group / Broadcast
 *
 * Routing strategy:
 * - localhost → Vite dev proxy  (/line-api  → https://api.line.me)
 * - production (Vercel) → /api/line-push serverless function (server-to-server, no CORS)
 */
export const sendLineFlexOrText = async (flexObj, fallbackText) => {
  const token = LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  let rawGroupId = await getStoredGroupId();
  if (typeof rawGroupId === 'object' && rawGroupId !== null) {
    rawGroupId = rawGroupId.groupId || '';
  }
  const groupId = typeof rawGroupId === 'string' ? rawGroupId.trim() : '';

  const linePath = groupId ? '/v2/bot/message/push' : '/v2/bot/message/broadcast';
  const lineBody = groupId
    ? { to: groupId, messages: [flexObj] }
    : { messages: [flexObj] };

  const isLocalDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  try {
    let response;

    if (isLocalDev) {
      // In local dev: use Vite proxy (/line-api → https://api.line.me)
      response = await fetch(`/line-api${linePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(lineBody),
      });
    } else {
      // In production (Vercel): call our own serverless /api/line-push
      // This avoids CORS entirely — the serverless function calls LINE server-to-server
      response = await fetch('/api/line-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: linePath, body: lineBody }),
      });
    }

    if (response.ok) {
      console.log('LINE Flex Message sent successfully!');
      return true;
    } else {
      const errText = await response.text();
      console.warn('LINE send warning:', response.status, errText);
      return false;
    }
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return false;
  }
};

/**
 * Send automated alert when a new production job is created
 */
export const notifyJobCreated = async (job) => {
  const flexMessage = createFlexMessageCard('✨ เปิดโครงการใหม่', job, job.current_stage || 'start', 'create');
  const fallbackText = `✨ [Nitan Tracker - เปิดโครงการใหม่]\n📌 ${job.id}: ${job.project_name}\n🚀 สถานะ: ${job.current_stage || 'start'}`;
  return sendLineFlexOrText(flexMessage, fallbackText);
};

/**
 * Send automated alert when a job stage/status is updated
 */
export const notifyJobStatusUpdated = async (job, stageLabel, updatedBy) => {
  const stageObj = WORKFLOW_STAGES.find(s => s.id === stageLabel || s.id === job.current_stage);
  const displayStageName = stageObj ? stageObj.label : (stageLabel || 'อัปเดตงาน');

  // Get the assignee from the current stage's Process data
  const currentStageId = stageObj?.id || job.current_stage;
  const currentStageData = job.stages?.[currentStageId] || {};
  const stageAssignee = currentStageData.assignee || updatedBy || '';
  const stageStatus = currentStageData.status || '';
  const stageDueDate = currentStageData.due_date || '';

  const flexMessage = createFlexMessageCard('🔄 อัปเดตสถานะ & กำหนดส่ง', job, displayStageName, 'update', '', stageAssignee, stageStatus, stageDueDate);
  const fallbackText = `🔄 [Nitan Tracker - อัปเดตสถานะงาน]\n📌 ${job.id}: ${job.project_name}\n⚡ ขั้นตอน: ${displayStageName}\n📊 สถานะ: ${stageStatus}\n📅 กำหนดส่ง: ${stageDueDate || 'ยังไม่กำหนด'}\n👤 ผู้รับผิดชอบ: ${stageAssignee}`;
  return sendLineFlexOrText(flexMessage, fallbackText);
};

/**
 * Send alert for overdue jobs
 */
export const notifyJobOverdue = async (job, daysOverdue = 1) => {
  const title = `⚠️ งานเลยกำหนดส่งมอบ (${daysOverdue} วัน)`;
  const extraText = `🚨 งานนี้เลยกำหนดส่งมอบแล้ว ${daysOverdue} วัน โปรดเร่งติดตาม!`;
  const flexMessage = createFlexMessageCard(title, job, job.current_stage || 'in_progress', 'overdue', extraText);
  const fallbackText = `⚠️ [Nitan Tracker - เลยกำหนดส่งมอบ]\n📌 ${job.id}: ${job.project_name}\n🚨 เลยกำหนดส่งมอบแล้ว ${daysOverdue} วัน`;
  return sendLineFlexOrText(flexMessage, fallbackText);
};

/**
 * Send 1-Day Advance Reminder alert before due date
 */
export const notifyJobUpcomingDue = async (job) => {
  const title = `⏰ เตือนส่งมอบล่วงหน้า 1 วัน`;
  const extraText = `📢 ถึงกำหนดส่งมอบในวันพรุ่งนี้ (${job.due_date || job.on_sale_date})`;
  const flexMessage = createFlexMessageCard(title, job, job.current_stage || 'in_progress', 'reminder', extraText);
  const fallbackText = `⏰ [Nitan Tracker - เตือนส่งมอบล่วงหน้า 1 วัน]\n📌 ${job.id}: ${job.project_name}\n📢 ถึงกำหนดส่งมอบในวันพรุ่งนี้!`;
  return sendLineFlexOrText(flexMessage, fallbackText);
};

/**
 * Test button handler to trigger a live LINE alert
 */
export const sendTestLineNotification = async () => {
  const sampleJob = {
    id: 'JOB-TEST-001',
    project_name: 'แก้วกาแฟพรีเมียม ลาย Summer Collection 2026',
    product_type: 'glass',
    specifications: { quantity: 5000 },
    current_stage: 'production',
    due_date: '2026-08-22'
  };
  return notifyJobStatusUpdated(sampleJob, 'In Production (กำลังผลิต)', 'ทดสอบผ่านเว็บ (Test Button)');
};

/**
 * Automatically check all active jobs for Overdue or 1-Day Upcoming Due Date
 */
export const checkAndSendDueReminders = async (jobs) => {
  if (!Array.isArray(jobs) || jobs.length === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifiedKey = 'niitan_notified_reminders';
  const notifiedMap = JSON.parse(localStorage.getItem(notifiedKey) || '{}');

  for (const job of jobs) {
    if (!job.due_date && !job.on_sale_date) continue;
    const dueDateStr = job.due_date || job.on_sale_date;
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

    // Case 1: 1 Day before due date (daysDiff === 1)
    if (daysDiff === 1) {
      const reminderKey = `reminder_1day_${job.id}_${dueDateStr}`;
      if (!notifiedMap[reminderKey]) {
        await notifyJobUpcomingDue(job);
        notifiedMap[reminderKey] = new Date().toISOString();
      }
    }

    // Case 2: Overdue (daysDiff < 0) and not completed
    if (daysDiff < 0 && job.current_stage !== 'complete' && job.current_stage !== 'on_sale') {
      const daysOverdue = Math.abs(daysDiff);
      const overdueKey = `overdue_${job.id}_${daysOverdue}d`;
      if (!notifiedMap[overdueKey]) {
        await notifyJobOverdue(job, daysOverdue);
        notifiedMap[overdueKey] = new Date().toISOString();
      }
    }
  }

  localStorage.setItem(notifiedKey, JSON.stringify(notifiedMap));
};
