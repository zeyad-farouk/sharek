import 'package:flutter/material.dart';

// اللون الأساسي الموحد
const Color kPrimaryColor = Color.fromARGB(255, 45, 43, 88);

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  // متغير عشان نعرف الترتيب الحالي
  bool isNewestFirst = true;

  // داتا وهمية للإشعارات
  List<NotificationModel> notifications = [
    // إشعار طلب (هيظهر فيه زرارين القبول والرفض)
    NotificationModel(
      id: '0',
      title: 'Rental Request',
      body: 'Karim wants to rent your "Power Drill" for 3 days.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
      type: NotificationType.alert, // النوع ده هو اللي بيظهر الأزرار
      isRead: false,
    ),
    // إشعار نجاح (معلومة بس)
    NotificationModel(
      id: '1',
      title: 'Request Accepted!',
      body: 'Ahmed accepted your request for "Canon Camera". You can pay now.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
      type: NotificationType.success,
      isRead: false,
    ),
    // إشعار رسالة
    NotificationModel(
      id: '2',
      title: 'New Message',
      body: 'Sarah sent you a message regarding "Mountain Bike".',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      type: NotificationType.message,
      isRead: true,
    ),
    // إشعار نظام
    NotificationModel(
      id: '3',
      title: 'Welcome to Sharek',
      body: 'Thanks for joining our community! Start renting now.',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      type: NotificationType.system,
      isRead: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _sortNotifications(); // ترتيب مبدئي
  }

  // دالة الترتيب
  void _sortNotifications() {
    setState(() {
      if (isNewestFirst) {
        notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      } else {
        notifications.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      }
    });
  }

  // دالة حذف إشعار (Swipe)
  void _deleteNotification(int index) {
    setState(() {
      notifications.removeAt(index);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Notification deleted"), duration: Duration(seconds: 1)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false, // عشان منعملش سهم رجوع لو هي في الـ MainLayout
        title: const Text(
          "Notifications",
          style: TextStyle(color: kPrimaryColor, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          // زرار الترتيب (Filter Icon)
          PopupMenuButton<bool>(
            icon: const Icon(Icons.sort, color: kPrimaryColor),
            onSelected: (value) {
              setState(() {
                isNewestFirst = value;
                _sortNotifications();
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: true,
                child: Text("Newest First"),
              ),
              const PopupMenuItem(
                value: false,
                child: Text("Oldest First"),
              ),
            ],
          ),
        ],
      ),
      body: notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                // السحب للحذف
                return Dismissible(
                  key: Key(notification.id),
                  direction: DismissDirection.endToStart,
                  onDismissed: (_) => _deleteNotification(index),
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    margin: const EdgeInsets.only(bottom: 15),
                    decoration: BoxDecoration(
                      color: Colors.red.shade100,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.delete, color: Colors.red),
                  ),
                  child: _buildNotificationCard(notification),
                );
              },
            ),
    );
  }

  // تصميم الكارت الواحد (تم تعديله لإضافة الأزرار)
  Widget _buildNotificationCard(NotificationModel notification) {
    // نحدد هل النوع ده محتاج أزرار ولا لأ (زي طلبات الإيجار)
    bool hasActions = notification.type == NotificationType.alert;

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: notification.isRead ? Colors.white : kPrimaryColor.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: notification.isRead ? Colors.grey.shade200 : kPrimaryColor.withOpacity(0.1),
        ),
        boxShadow: [
          if (!notification.isRead)
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 3),
            )
        ],
      ),
      child: Column(
        children: [
          // الجزء العلوي: الأيقونة والنص
          ListTile(
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            onTap: () {
              setState(() {
                notification.isRead = true; // تعليمه كمقروء عند الضغط
              });
            },
            leading: Stack(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: _getIconColor(notification.type).withOpacity(0.1),
                  child: Icon(_getIcon(notification.type), color: _getIconColor(notification.type), size: 22),
                ),
                if (!notification.isRead)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    notification.title,
                    style: TextStyle(
                      fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.bold,
                      color: kPrimaryColor,
                      fontSize: 16,
                    ),
                  ),
                ),
                Text(
                  _getTimeAgo(notification.timestamp),
                  style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                ),
              ],
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 6.0),
              child: Text(
                notification.body,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13, height: 1.3),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),

          // الجزء السفلي: الأزرار (تظهر فقط لو hasActions = true)
          if (hasActions)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        _deleteNotification(notifications.indexOf(notification));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Request Declined")),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.grey.shade300),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      child: const Text("Decline", style: TextStyle(color: Colors.black)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // هنا ممكن نضيف لوجيك الموافقة
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Request Accepted!")),
                        );
                        setState(() {
                          notification.isRead = true; // نخليه مقروء
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: kPrimaryColor,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      child: const Text("Accept", style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // حالة لو مفيش إشعارات
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off_outlined, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 20),
          const Text("No Notifications Yet", style: TextStyle(fontSize: 18, color: Colors.grey)),
        ],
      ),
    );
  }

  // أيقونات وألوان حسب نوع الإشعار
  IconData _getIcon(NotificationType type) {
    switch (type) {
      case NotificationType.success: return Icons.check_circle;
      case NotificationType.alert: return Icons.notifications_active; // تغيير الأيقونة
      case NotificationType.message: return Icons.message;
      case NotificationType.system: return Icons.info;
    }
  }

  Color _getIconColor(NotificationType type) {
    switch (type) {
      case NotificationType.success: return Colors.green;
      case NotificationType.alert: return Colors.orange;
      case NotificationType.message: return Colors.blue;
      case NotificationType.system: return kPrimaryColor;
    }
  }

  // حساب الوقت
  String _getTimeAgo(DateTime time) {
    final difference = DateTime.now().difference(time);
    if (difference.inDays > 0) return "${difference.inDays}d ago";
    if (difference.inHours > 0) return "${difference.inHours}h ago";
    if (difference.inMinutes > 0) return "${difference.inMinutes}m ago";
    return "Just now";
  }
}

// --- Models ---
enum NotificationType { success, alert, message, system }

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  final NotificationType type;
  bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    required this.type,
    this.isRead = false,
  });
}