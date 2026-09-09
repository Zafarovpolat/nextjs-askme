'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProfileHeaderBlock from '@/components/profile/ProfileHeaderBlock'
import ProfileMenuListMob from '@/components/profile/ProfileMenuListMob'
import ProfileWeeklyLeadersSidebar from '@/components/ProfileWeeklyLeadersSidebar'
import ComplaintModal from '@/components/ComplaintModal'
import SharePopup from '@/components/SharePopup'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'
import { formatTimeAgo } from '@/lib/time-ago'
import {
  buildNotificationViewModel,
  type NotificationApiItem,
  type NotificationViewModel,
} from '@/lib/notification-meta'
import { displayPremiumBadge, displayUserName, displayUserSubtitle } from '@/lib/ai-user-display'
import {
  compactCountTitle,
  formatCompactCount,
} from '@/lib/format-compact-count'
import type { MeApiResponse } from '@/lib/server-me'
import type { ProfileWidgetsPayload } from '@/lib/server-profile-widgets'
import { usePageStickySidebars } from '@/hooks/usePageStickySidebars'
import { avatarImgProps } from '@/lib/avatar-srcset'

type NotificationsPageResponse = {
  notifications: NotificationApiItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const PAGE_SIZE = 20
const DEFAULT_AVATAR = '/images/icons/avatar.svg'

function BellIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden>
      <path d="M15.6636 13.8085C15.5945 13.7192 15.5267 13.6299 15.4601 13.5438C14.5442 12.3558 13.9901 11.6388 13.9901 8.27589C13.9901 6.53482 13.6016 5.10625 12.836 4.03482C12.2715 3.2433 11.5084 2.64286 10.5026 2.19911C10.4896 2.19139 10.4781 2.18126 10.4684 2.1692C10.1067 0.870089 9.11666 0 8.0001 0C6.88355 0 5.89396 0.870089 5.53219 2.16786C5.52253 2.17948 5.51113 2.18928 5.49846 2.19688C3.15128 3.23304 2.01057 5.22098 2.01057 8.27455C2.01057 11.6388 1.45729 12.3558 0.540562 13.5424C0.473952 13.6286 0.406092 13.7161 0.336984 13.8071C0.158468 14.038 0.0453637 14.3189 0.0110561 14.6165C-0.0232514 14.9141 0.0226739 15.2161 0.143397 15.4866C0.400264 16.067 0.947719 16.4272 1.57261 16.4272H14.4322C15.0542 16.4272 15.5979 16.0674 15.8556 15.4897C15.9768 15.2191 16.0232 14.917 15.9892 14.619C15.9551 14.321 15.8422 14.0397 15.6636 13.8085Z" />
      <path d="M8.0001 20C8.60169 19.9995 9.19194 19.8244 9.70823 19.4932C10.2245 19.1621 10.6476 18.6873 10.9326 18.1192C10.9461 18.092 10.9527 18.0615 10.9519 18.0307C10.9511 17.9999 10.9429 17.9699 10.928 17.9435C10.9132 17.9171 10.8922 17.8953 10.8672 17.8802C10.8422 17.865 10.814 17.8571 10.7853 17.8571H5.21579C5.18703 17.857 5.15874 17.8649 5.13366 17.88C5.10859 17.8951 5.08759 17.9169 5.07271 17.9433C5.05783 17.9697 5.04957 17.9998 5.04874 18.0306C5.04792 18.0614 5.05455 18.0919 5.06799 18.1192C5.35298 18.6872 5.776 19.162 6.29221 19.4931C6.80843 19.8242 7.39858 19.9994 8.0001 20Z" />
    </svg>
  )
}

function MarkAllIcon() {
  return (
    <svg width="15" height="14" viewBox="0 0 15 14" aria-hidden>
      <path d="M2.80639 0.843849V3.27139C2.80639 3.47157 2.88495 3.66301 3.02386 3.80135C4.13735 4.91023 6.78669 7.54458 7.5 8.24379C8.55615 7.20854 8.26031 7.50205 8.3682 7.38232C8.4005 7.34645 8.43608 7.31581 8.47363 7.28944L11.9761 3.80135C12.115 3.66301 12.1936 3.47154 12.1936 3.27139V0.841955C12.1936 0.456113 11.9066 0.135683 11.5369 0.110356C9.30733 -0.0423127 5.64717 -0.0316806 3.4664 0.112006C3.09534 0.136478 2.80639 0.456632 2.80639 0.843849Z" />
      <path d="M14.2613 2.56405C14.1904 2.45944 14.093 2.37881 13.9717 2.33115C13.717 2.23116 13.4452 2.43002 13.4452 2.71345V3.91066C13.4443 4.08013 13.3695 4.25254 13.2416 4.37786L9.72321 7.82667L13.2409 11.2641C13.489 11.5066 13.5014 11.9126 13.2686 12.171C13.0358 12.4295 12.646 12.4423 12.3979 12.1999L8.82427 8.70782L7.92219 9.59208C7.68499 9.82462 7.31498 9.82462 7.07778 9.59208L6.17567 8.70782L2.60208 12.1999C2.35396 12.4423 1.9641 12.4294 1.73129 12.171C1.49849 11.9126 1.51093 11.5066 1.75902 11.2641L5.27673 7.82667L1.75834 4.37786C1.63012 4.25217 1.55531 4.08062 1.55473 3.91066V2.71684C1.55473 2.413 1.24659 2.216 0.98642 2.35349C0.838307 2.43176 0.739478 2.51975 0.672652 2.68886C0.17824 3.93816 0 6.39136 0 7.82132C0 9.2584 0.185045 11.7497 0.674882 12.9589C0.704804 13.0327 0.749745 13.1016 0.795331 13.1515C1.68674 14.1282 11.2989 14.3656 13.9763 13.3097C14.0888 13.2653 14.1872 13.1869 14.2595 13.0811C14.6406 12.5233 15 9.97414 15 7.82132C15 5.81506 14.6604 3.15459 14.2613 2.56405Z" />
    </svg>
  )
}

function EmptyNotificationsIcon() {
  return (
    <svg
      className="notifications-cabinet__empty-icon"
      width="62"
      height="60"
      viewBox="0 0 62 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M61.869 0.481696C61.6787 0.156732 61.3156 -0.0292369 60.9354 0.00376541L37.4559 2.0858C37.0317 2.12338 36.6811 2.42787 36.5894 2.83811C36.4977 3.24835 36.6861 3.66991 37.0549 3.87997L46.0492 9.00086C45.7009 9.21285 45.3515 9.41568 45.0052 9.60478C44.533 9.86242 44.3621 10.4487 44.6233 10.9144C44.8016 11.2323 45.1351 11.4116 45.479 11.4116C45.6391 11.4116 45.8013 11.3728 45.9511 11.291C46.1265 11.1954 46.3024 11.0958 46.4785 10.9945L46.4778 19.9775C46.4778 20.3976 46.7538 20.7693 47.1598 20.8963C47.2571 20.9266 47.3563 20.9413 47.4546 20.9413C47.7667 20.9413 48.0673 20.7934 48.2537 20.5323L61.8219 1.51802C62.041 1.211 62.0593 0.80666 61.8691 0.481696H61.869ZM56.6964 2.31453L47.4559 7.57647L40.7047 3.73266L56.6964 2.31453ZM48.4328 9.24537L57.6733 3.98343L48.4322 16.9338L48.4328 9.24537ZM44.2238 35.3272L39.8621 31.7431V20.1997C39.8621 18.8814 38.7747 17.8089 37.438 17.8089H10.8975C9.56091 17.8089 8.47343 18.8813 8.47343 20.1997V31.7431L4.11179 35.3272C3.30177 35.9926 2.87362 36.8939 2.87362 37.9338V56.6074C2.87362 58.478 4.41672 60 6.31337 60H42.022C43.9187 60 45.4616 58.4782 45.4616 56.6075V37.9338C45.4616 36.909 45.022 35.9834 44.2237 35.3272H44.2238ZM32.6144 44.9251L43.508 38.4954V56.5708L32.6144 44.9251ZM42.8014 36.6667L39.8622 38.4014V34.2515L42.8014 36.6667ZM10.8975 19.736H37.4381C37.6974 19.736 37.9083 19.944 37.9083 20.1997V39.5547L24.9306 47.2145C24.4389 47.5047 23.8967 47.5049 23.4048 47.2145L10.4274 39.5548V20.1997C10.4274 19.944 10.6383 19.736 10.8975 19.736ZM4.82766 56.5708V38.4954L15.7211 44.9251L4.82766 56.5708ZM8.47343 38.4014L5.53425 36.6667L8.47343 34.2515V38.4016V38.4014ZM6.31349 58.0727C6.23986 58.0727 6.16817 58.0656 6.09734 58.0554L17.4339 45.936L22.4013 48.868C22.9544 49.1944 23.5611 49.3576 24.1678 49.3576C24.7745 49.3576 25.3811 49.1944 25.934 48.868L30.9016 45.936L42.2383 58.0554C42.1676 58.0656 42.0958 58.0727 42.0223 58.0727H6.31349ZM35.5912 33.589C35.5912 34.1211 35.1537 34.5526 34.6142 34.5526H27.6879C27.1484 34.5526 26.711 34.1211 26.711 33.589C26.711 33.0569 27.1484 32.6254 27.6879 32.6254H34.6142C35.1537 32.6254 35.5912 33.0569 35.5912 33.589ZM35.5912 38.7709C35.5912 39.303 35.1537 39.7344 34.6142 39.7344H32.2929C31.7534 39.7344 31.316 39.303 31.316 38.7709C31.316 38.2387 31.7534 37.8073 32.2929 37.8073H34.6142C35.1537 37.8073 35.5912 38.2387 35.5912 38.7709ZM30.0055 38.7709C30.0055 39.303 29.5681 39.7344 29.0286 39.7344H25.4449C24.9054 39.7344 24.468 39.303 24.468 38.7709C24.468 38.2387 24.9054 37.8073 25.4449 37.8073H29.0286C29.5681 37.8073 30.0055 38.2387 30.0055 38.7709ZM26.7198 29.3706H19.0301C18.4906 29.3706 18.0531 28.9392 18.0531 28.4071C18.0531 27.8749 18.4906 27.4435 19.0301 27.4435H26.7198C27.2593 27.4435 27.6967 27.8749 27.6967 28.4071C27.6967 28.9392 27.2593 29.3706 26.7198 29.3706ZM23.006 38.7709C23.006 39.303 22.5685 39.7344 22.029 39.7344H18.6228C18.0833 39.7344 17.6459 39.303 17.6459 38.7709C17.6459 38.2387 18.0833 37.8073 18.6228 37.8073H22.029C22.5685 37.8073 23.006 38.2387 23.006 38.7709ZM12.7445 38.7709C12.7445 38.2387 13.1819 37.8073 13.7214 37.8073H15.5101C16.0496 37.8073 16.4871 38.2387 16.4871 38.7709C16.4871 39.303 16.0496 39.7344 15.5101 39.7344H13.7214C13.1819 39.7344 12.7445 39.303 12.7445 38.7709ZM12.7445 33.589C12.7445 33.0569 13.1819 32.6254 13.7214 32.6254H24.0076C24.5471 32.6254 24.9846 33.0569 24.9846 33.589C24.9846 34.1211 24.5471 34.5526 24.0076 34.5526H13.7214C13.1819 34.5526 12.7445 34.1211 12.7445 33.589ZM12.7445 28.4071C12.7445 27.8749 13.1819 27.4435 13.7214 27.4435H15.9739C16.5134 27.4435 16.9509 27.8749 16.9509 28.4071C16.9509 28.9392 16.5134 29.3706 15.9739 29.3706H13.7214C13.1819 29.3706 12.7445 28.9392 12.7445 28.4071ZM21.6979 23.2252C21.6979 22.6931 22.1354 22.2616 22.6749 22.2616H34.6142C35.1537 22.2616 35.5912 22.6931 35.5912 23.2252C35.5912 23.7573 35.1537 24.1888 34.6142 24.1888H22.6749C22.1354 24.1888 21.6979 23.7573 21.6979 23.2252ZM12.7445 23.2252C12.7445 22.6931 13.1819 22.2616 13.7214 22.2616H18.1815C18.721 22.2616 19.1584 22.6931 19.1584 23.2252C19.1584 23.7573 18.721 24.1888 18.1815 24.1888H13.7214C13.1819 24.1888 12.7445 23.7573 12.7445 23.2252ZM35.5912 28.4071C35.5912 28.9392 35.1537 29.3706 34.6142 29.3706H29.9254C29.3859 29.3706 28.9484 28.9392 28.9484 28.4071C28.9484 27.8749 29.3859 27.4435 29.9254 27.4435H34.6142C35.1537 27.4435 35.5912 27.8749 35.5912 28.4071ZM14.5043 7.85361C14.6192 7.33365 15.1403 7.00447 15.667 7.11756L15.8319 7.1537C16.3979 7.27884 16.9854 7.43085 17.6271 7.6179C18.1445 7.76882 18.4399 8.30492 18.2869 8.81514C18.1612 9.23417 17.772 9.50565 17.3503 9.50565C17.2586 9.50565 17.1653 9.49289 17.073 9.46591C16.4736 9.29102 15.9273 9.14974 15.4029 9.03363L15.2506 9.00038C14.7234 8.88692 14.3893 8.37346 14.5043 7.85361ZM29.4052 12.4691C29.5109 11.9472 30.0263 11.609 30.5546 11.7131C31.1848 11.8373 31.8096 11.9383 32.4116 12.0135C32.947 12.0803 33.326 12.5625 33.2583 13.0903C33.1959 13.5772 32.7752 13.933 32.2903 13.933C32.2494 13.933 32.2081 13.9305 32.1664 13.9253C31.5185 13.8445 30.8473 13.736 30.1717 13.6028C29.6426 13.4984 29.2993 12.9909 29.4052 12.4691ZM6.73823 7.83723C6.647 7.31281 7.0042 6.81464 7.53591 6.72467C8.19084 6.61386 8.88681 6.54352 9.60439 6.5157C10.1448 6.49751 10.5978 6.90895 10.6191 7.44072C10.6402 7.97249 10.2204 8.42055 9.6812 8.44151C9.04837 8.46596 8.43777 8.52751 7.86637 8.62423C7.81056 8.63362 7.75488 8.6382 7.70004 8.6382C7.23306 8.6382 6.82005 8.30685 6.73835 7.83747L6.73823 7.83723ZM21.9687 10.1105C22.1534 9.61068 22.7141 9.35293 23.221 9.53516C23.9506 9.79738 24.5135 9.99527 25.0466 10.1769C25.5566 10.3507 25.8271 10.8995 25.6508 11.4024C25.511 11.8012 25.1324 12.0515 24.7274 12.0515C24.6216 12.0515 24.5139 12.0344 24.4083 11.9985C23.8646 11.8132 23.2921 11.6119 22.552 11.346C22.0452 11.1637 21.7839 10.6106 21.9687 10.1105ZM0.563227 11.3444C0.892462 10.6845 1.31793 10.0754 1.82754 9.53408C2.19475 9.14444 2.8128 9.12167 3.20835 9.48373C3.60365 9.84592 3.62649 10.4555 3.25939 10.8456C2.87911 11.2496 2.56184 11.7036 2.31638 12.1953C2.14639 12.536 1.79969 12.7337 1.43907 12.7337C1.29412 12.7337 1.14708 12.7018 1.00848 12.6345C0.524393 12.3996 0.32497 11.8218 0.563227 11.3444ZM37.1647 13.0846C37.0871 12.558 37.4573 12.0691 37.9913 11.9928C38.6004 11.9055 39.2141 11.7875 39.8149 11.6416C40.3393 11.5151 40.8682 11.8305 40.9971 12.3471C41.1259 12.8639 40.8057 13.3858 40.2818 13.513C39.6197 13.6736 38.9435 13.8038 38.2719 13.8999C38.2244 13.9068 38.1772 13.91 38.1305 13.91C37.653 13.91 37.2355 13.5645 37.1649 13.0846H37.1647ZM3.78536 24.8058C3.44795 24.3905 3.51585 23.7841 3.93691 23.4514C4.35786 23.1185 4.97262 23.1855 5.31015 23.6009C5.69251 24.0716 6.1065 24.5439 6.54088 25.0046C6.90822 25.3943 6.88563 26.004 6.49057 26.3664C6.30238 26.5389 6.06364 26.6243 5.82562 26.6243C5.56355 26.6243 5.30234 26.5211 5.10988 26.3168C4.64314 25.8216 4.1974 25.3131 3.78536 24.8058ZM2.46952 18.9036C2.66626 19.3991 2.41847 19.9582 1.91619 20.1523C1.7992 20.1974 1.67867 20.2189 1.56009 20.2189C1.1698 20.2189 0.801116 19.9865 0.650176 19.6065C0.387618 18.945 0.177327 18.2819 0.0254099 17.6352C-0.0963437 17.1167 0.231182 16.599 0.756665 16.4789C1.28288 16.3588 1.80726 16.6817 1.92902 17.2001C2.05944 17.7559 2.24128 18.3291 2.46952 18.9036Z"
        fill="#6069FF"
      />
    </svg>
  )
}

export default function NotificationsPageClient({
  initialMe,
  initialWidgets,
}: {
  initialMe: MeApiResponse
  initialWidgets: ProfileWidgetsPayload
}) {
  const router = useRouter()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const isLoadingAuth = useAuthStore((s) => s.isLoading)
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe)
  const logout = useAuthStore((s) => s.logout)
  const storeUser = useAuthStore((s) => s.user)

  const meUser = storeUser ?? initialMe.user

  const [notifications, setNotifications] = useState<NotificationViewModel[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const loadingRef = useRef(false)

  const [complaint, setComplaint] = useState<{ questionId?: number; answerId?: number } | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  const { wrapperRef, leftSidebarRef, rightSidebarRef } = usePageStickySidebars()

  useEffect(() => {
    hydrateFromMe({
      user: initialMe.user,
      favorite_question_ids: initialMe.favorite_question_ids ?? [],
      favorite_answer_ids: initialMe.favorite_answer_ids ?? [],
      subscribed_user_ids: initialMe.subscribed_user_ids ?? [],
      subscribed_question_ids: initialMe.subscribed_question_ids ?? [],
    })
  }, [hydrateFromMe, initialMe])

  useEffect(() => {
    if (!isLoadingAuth && !isAuthorized) {
      router.replace('/login')
    }
  }, [isLoadingAuth, isAuthorized, router])

  useEffect(() => {
    if (!isAuthorized) return
    setLoading(true)
    api
      .get<NotificationsPageResponse>(`v1/notifications?page=1&per_page=${PAGE_SIZE}`)
      .then((data) => {
        setNotifications((data.notifications ?? []).map(buildNotificationViewModel))
        setCurrentPage(data.current_page ?? 1)
        setLastPage(data.last_page ?? 1)
      })
      .catch(() => {
        setNotifications([])
      })
      .finally(() => setLoading(false))
  }, [isAuthorized])

  const hasUnread = useMemo(() => notifications.some((n) => !n.is_read), [notifications])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || currentPage >= lastPage) return
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const data = await api.get<NotificationsPageResponse>(
        `v1/notifications?page=${currentPage + 1}&per_page=${PAGE_SIZE}`
      )
      setNotifications((prev) => [
        ...prev,
        ...(data.notifications ?? []).map(buildNotificationViewModel),
      ])
      setCurrentPage(data.current_page ?? currentPage + 1)
      setLastPage(data.last_page ?? lastPage)
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }, [currentPage, lastPage])

  const markAllRead = useCallback(async () => {
    if (!hasUnread || markingAll) return
    setMarkingAll(true)
    try {
      await api.post('v1/notifications/mark-all-read')
      useAuthStore.getState().markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      /* ignore */
    } finally {
      setMarkingAll(false)
    }
  }, [hasUnread, markingAll])

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    useAuthStore.getState().markNotificationsRead([id])
    try {
      await api.post('v1/notifications/mark-read', { ids: [id] })
    } catch {
      /* ignore */
    }
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    router.replace('/login')
  }, [logout, router])

  const openShare = useCallback((e: React.MouseEvent<HTMLButtonElement>, n: NotificationViewModel) => {
    e.preventDefault()
    e.stopPropagation()
    const btn = e.currentTarget
    if (shareButtonRef.current === btn && isShareOpen) {
      setIsShareOpen(false)
      return
    }
    shareButtonRef.current = btn
    const href = n.shareHref || n.url || '/notifications'
    const absolute =
      typeof window !== 'undefined' && href.startsWith('/')
        ? `${window.location.origin}${href}`
        : href
    setShareData({
      title: n.title || 'Уведомление',
      url: absolute,
    })
    setIsShareOpen(true)
  }, [isShareOpen])

  const displayName = displayUserName(meUser)
  const rankLabel = displayUserSubtitle(meUser)
  const isPremiumUser = Boolean(meUser.premium_is_active ?? meUser.is_premium)
  const premiumBadgeText = displayPremiumBadge(meUser) ?? 'Премиум'
  const avatarUrl = meUser.avatar_url || DEFAULT_AVATAR
  const avatarUrl2x = meUser.avatar_url_2x ?? null
  const ballsRaw = meUser.balls ?? 0
  const ballsDisplay = meUser.is_ai ? '∞' : formatCompactCount(ballsRaw)
  const ballsTitle = compactCountTitle(ballsRaw)
  const kpdPercent = Math.round(Number(meUser.kpd ?? 0))
  const registeredAgo = meUser.created_at ? formatTimeAgo(meUser.created_at) : ''
  const registeredInService = registeredAgo.replace(/\s+назад$/, '')

  return (
    <div className="profile_page_layout">
      <div className="container">
        <Breadcrumbs
          items={[
            { name: 'Главная', href: '/' },
            { name: 'Профиль', href: '/profile' },
            { name: 'Уведомления', href: '/notifications' },
          ]}
        />

        <div className="profile_page" ref={wrapperRef}>
          <div className="profile_menu_column" ref={leftSidebarRef}>
            <div className="profile_menu">
              <div className="blocks_title">
                <h2>Ваш профиль</h2>
              </div>
              <div className="profile_menu_list tabs_list">
                <Link href="/profile?tab=edit" className="profile_menu_item menu_item profile-edit-btn" title="Редактировать профиль">
                  <svg width="15.714844" height="20">
                    <use xlinkHref="/sprites.svg#profile" />
                  </svg>
                  <p className="main_text">Редактировать профиль</p>
                </Link>
                <Link href="/notifications" className="profile_menu_item menu_item active_menu" title="Уведомления">
                  <BellIcon />
                  <p className="main_text">Уведомления</p>
                </Link>
                <Link href="/profile?tab=levels" className="profile_menu_item menu_item" title="Уровни">
                  <svg width="13" height="20">
                    <use xlinkHref="/sprites.svg#levels" />
                  </svg>
                  <p className="main_text">Уровни</p>
                </Link>
                <Link href="/profile?tab=rules" className="profile_menu_item menu_item" title="Ограничения">
                  <svg width="20" height="17">
                    <use xlinkHref="/sprites.svg#rules" />
                  </svg>
                  <p className="main_text">Ограничения</p>
                </Link>
                <Link href="/profile?tab=vip" className="profile_menu_item menu_item" title="Пакеты">
                  <svg width="16" height="20">
                    <use xlinkHref="/sprites.svg#vip" />
                  </svg>
                  <p className="main_text">Пакеты</p>
                </Link>
                <Link href="/profile?tab=settings" className="profile_menu_item menu_item" title="Настройки">
                  <svg width="20" height="20">
                    <use xlinkHref="/sprites.svg#settings" />
                  </svg>
                  <p className="main_text">Настройки</p>
                </Link>
                <div
                  className="profile_menu_item menu_item"
                  title="Выход"
                  onClick={handleLogout}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                >
                  <svg width="20" height="20" aria-hidden>
                    <use xlinkHref="/sprites.svg#logout-profile" />
                  </svg>
                  <p className="main_text">Выход</p>
                </div>
              </div>
            </div>
            <div className="profile_menu_weekly profile_menu_weekly--sidebar">
              <ProfileWeeklyLeadersSidebar initialWidgets={initialWidgets} />
            </div>
          </div>

          <div className="profile_page_content">
            <ProfileHeaderBlock
              variant="cabinet"
              premium={isPremiumUser}
              premiumBadgeText={premiumBadgeText}
              displayName={displayName}
              rankLabel={rankLabel}
              registeredInService={registeredInService}
              avatarUrl={avatarUrl}
              avatarUrl2x={avatarUrl2x}
              ballsDisplay={ballsDisplay}
              ballsTitle={ballsTitle}
              kpdPercentDisplay={`${kpdPercent}%`}
              cabinetFooter={
                <ProfileMenuListMob>
                  <Link href="/profile?tab=edit" className="profile_menu_item menu_item_m" title="Редактировать профиль">
                    <svg width="15.714844" height="20">
                      <use xlinkHref="/sprites.svg#profile" />
                    </svg>
                  </Link>
                  <Link href="/notifications" className="profile_menu_item menu_item_m active_menu" title="Уведомления">
                    <BellIcon />
                  </Link>
                  <Link href="/profile?tab=levels" className="profile_menu_item menu_item_m" title="Уровни">
                    <svg width="13" height="20">
                      <use xlinkHref="/sprites.svg#levels" />
                    </svg>
                  </Link>
                  <Link href="/profile?tab=rules" className="profile_menu_item menu_item_m" title="Ограничения">
                    <svg width="20" height="17">
                      <use xlinkHref="/sprites.svg#rules" />
                    </svg>
                  </Link>
                  <Link href="/profile?tab=vip" className="profile_menu_item menu_item_m" title="Пакеты">
                    <svg width="16" height="20">
                      <use xlinkHref="/sprites.svg#vip" />
                    </svg>
                  </Link>
                  <Link href="/profile?tab=settings" className="profile_menu_item menu_item_m" title="Настройки">
                    <svg width="20" height="20">
                      <use xlinkHref="/sprites.svg#settings" />
                    </svg>
                  </Link>
                  <div className="profile_menu_item menu_item_m" onClick={handleLogout} role="button" title="Выход">
                    <svg width="20" height="20" aria-hidden>
                      <use xlinkHref="/sprites.svg#logout-profile" />
                    </svg>
                  </div>
                </ProfileMenuListMob>
              }
            />

            <div className="user_profile_pages">
              <div className="menu_item_content menu_item_content_m active_menu notifications-cabinet">
                <div className="notifications-cabinet__header">
                  <div className="blocks_title">
                    <h2>Уведомления</h2>
                  </div>
                  {hasUnread && notifications.length > 0 && (
                    <button
                      type="button"
                      className="notifications-cabinet__mark-all"
                      onClick={() => void markAllRead()}
                      disabled={markingAll}
                    >
                      <MarkAllIcon />
                      <span>{markingAll ? 'Отмечаем…' : 'Отметить все как прочитанные'}</span>
                    </button>
                  )}
                </div>

                {loading ? (
                  <p className="secondary_text">Загрузка…</p>
                ) : notifications.length === 0 ? (
                  <div className="notifications-cabinet__empty" role="status">
                    <EmptyNotificationsIcon />
                    <p className="notifications-cabinet__empty-text">
                      У вас пока
                      <br />
                      нет уведомлений
                    </p>
                  </div>
                ) : (
                  <div className="notifications-cabinet__list">
                    {notifications.map((n) => {
                      const cardMod = !n.is_read
                        ? 'notifications-card--unread'
                        : n.isPointsRelated
                          ? 'notifications-card--read notifications-card--read-points'
                          : 'notifications-card--read'
                      return (
                      <article
                        key={n.id}
                        className={`notifications-card ${cardMod}`}
                        onClick={() => {
                          if (!n.is_read) void markRead(n.id)
                        }}
                      >
                        <div className="notifications-card__top">
                          <div className="notifications-card__actor">
                            {n.actorProfileHref ? (
                              <Link
                                href={n.actorProfileHref}
                                className="notifications-card__avatar-link"
                                onClick={() => {
                                  if (!n.is_read) void markRead(n.id)
                                }}
                              >
                                <img
                                  {...avatarImgProps(n.actorAvatarUrl, n.actorAvatarUrl2x)}
                                  alt=""
                                  className="notifications-card__avatar"
                                  width={40}
                                  height={40}
                                />
                              </Link>
                            ) : (
                              <img
                                {...avatarImgProps(n.actorAvatarUrl, n.actorAvatarUrl2x)}
                                alt=""
                                className="notifications-card__avatar"
                                width={40}
                                height={40}
                              />
                            )}
                            <div className="notifications-card__actor-meta">
                              <div className="notifications-card__name-row">
                                {n.actorProfileHref ? (
                                  <Link
                                    href={n.actorProfileHref}
                                    className="notifications-card__name"
                                    onClick={() => {
                                      if (!n.is_read) void markRead(n.id)
                                    }}
                                  >
                                    {n.actorName}
                                  </Link>
                                ) : (
                                  <span className="notifications-card__name">{n.actorName}</span>
                                )}
                                <span className="notifications-card__type">
                                  <span className="notifications-card__type-dot" aria-hidden />
                                  {n.typeLabel}
                                </span>
                              </div>
                              <span className="notifications-card__time">{formatTimeAgo(n.created_at)}</span>
                            </div>
                          </div>
                          <span
                            className={`notifications-card__status${n.is_read ? ' notifications-card__status--read' : ' notifications-card__status--unread'}`}
                          >
                            {n.is_read ? 'Прочитано' : 'Не прочитано'}
                          </span>
                        </div>

                        <div className="notifications-card__body">
                          {n.url ? (
                            <Link
                              href={n.url}
                              className="notifications-card__text-link"
                              onClick={() => {
                                if (!n.is_read) void markRead(n.id)
                              }}
                            >
                              {n.text}
                            </Link>
                          ) : (
                            <p className="notifications-card__text">{n.text}</p>
                          )}
                        </div>

                        <div className="notifications-card__footer">
                          <div className="notifications-card__footer-left">
                            {n.canReply && n.replyHref && (
                              <Link
                                href={n.replyHref}
                                className="m_btn category_btn notifications-card__reply"
                                onClick={() => {
                                  if (!n.is_read) void markRead(n.id)
                                }}
                              >
                                Ответить
                              </Link>
                            )}
                          </div>
                          <div className="notifications-card__footer-right">
                            {n.complaint && (
                              <button
                                type="button"
                                className="notifications-card__report"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!n.is_read) void markRead(n.id)
                                  setComplaint(
                                    'answerId' in n.complaint!
                                      ? { answerId: n.complaint.answerId }
                                      : { questionId: n.complaint!.questionId }
                                  )
                                }}
                              >
                                Пожаловаться
                              </button>
                            )}
                            {n.shareHref && (
                              <button
                                type="button"
                                className="notifications-card__share"
                                aria-label="Поделиться"
                                onClick={(e) => {
                                  if (!n.is_read) void markRead(n.id)
                                  openShare(e, n)
                                }}
                              >
                                <svg width="14" height="14" aria-hidden>
                                  <use xlinkHref="/sprites.svg#share" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                      )
                    })}

                    {currentPage < lastPage && (
                      <div className="show_more_btn_wrapper">
                        <button
                          className="show_more_btn"
                          type="button"
                          onClick={() => void loadMore()}
                          disabled={loadingMore}
                        >
                          <svg width="22" height="22">
                            <use xlinkHref="/sprites.svg#sync" />
                          </svg>
                          {loadingMore ? 'Загрузка…' : 'Показать еще'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="line" />

          <div className="profile_stats_column" ref={rightSidebarRef}>
            <div className="profile_stats">
              <div className="blocks_title">
                <h2>Статистика</h2>
              </div>
              <div className="profile_stats_list">
                <Link href="/profile" className="profile_stats_item">
                  <p className="main_text">Вопросы</p>
                  <div className="stats_badge">
                    <p className="main_text" title={compactCountTitle(meUser.questions_count ?? 0)}>
                      {formatCompactCount(meUser.questions_count ?? 0)}
                    </p>
                  </div>
                </Link>
                <Link href="/profile" className="profile_stats_item">
                  <p className="main_text">Ответы</p>
                  <div className="stats_badge">
                    <p className="main_text" title={compactCountTitle(meUser.answers_count ?? 0)}>
                      {formatCompactCount(meUser.answers_count ?? 0)}
                    </p>
                  </div>
                </Link>
                <Link href="/profile" className="profile_stats_item">
                  <p className="main_text">Подписки</p>
                  <div className="stats_badge">
                    <p className="main_text" title={compactCountTitle(meUser.subscriptions_count ?? 0)}>
                      {formatCompactCount(meUser.subscriptions_count ?? 0)}
                    </p>
                  </div>
                </Link>
                <Link href="/profile" className="profile_stats_item">
                  <p className="main_text">Подписчики</p>
                  <div className="stats_badge">
                    <p className="main_text" title={compactCountTitle(meUser.subscribers_count ?? 0)}>
                      {formatCompactCount(meUser.subscribers_count ?? 0)}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <ComplaintModal
        isOpen={complaint !== null}
        onClose={() => setComplaint(null)}
        questionId={complaint?.questionId}
        answerId={complaint?.answerId}
      />
      <SharePopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        anchorRef={shareButtonRef}
        title={shareData.title}
        url={shareData.url}
      />
    </div>
  )
}
