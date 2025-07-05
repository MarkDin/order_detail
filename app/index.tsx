import { fetchOrderBasicInfo, fetchOrderData, fetchSubOrderData } from '@/api';
import { OrderDisplayItem, SubOrderDisplayItem } from '@/types';
import { ShoppingCart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// 可复用的头部组件
const OrderHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>订单详情</Text>
  </View>
);

export default function OrderDetails() {
  const [order_id, setOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'suborders'>('info');
  const [orderData, setOrderData] = useState<OrderDisplayItem[]>([]);
  const [subOrderData, setSubOrderData] = useState<SubOrderDisplayItem[]>([]);
  const [orderBasicInfo, setOrderBasicInfo] = useState({
    orderNumber: '',
    status: '加载中...',
    amount: '$0'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取URL参数
    const getOrderIdFromUrl = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const urlObj = new URL(url);
          const orderId = urlObj.searchParams.get('order_id');
          setOrderId(orderId);
          if (orderId) {
            setOrderBasicInfo(prev => ({ ...prev, orderNumber: orderId }));
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('获取URL参数失败:', error);
        setLoading(false);
      }
    };

    getOrderIdFromUrl();
  }, []);

  useEffect(() => {
    if (order_id) {
      loadData();
    }
  }, [order_id]);

  const loadData = async () => {
    if (!order_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 并行获取所有数据
      const [orderInfo, subOrders, basicInfo] = await Promise.all([
        fetchOrderData(order_id),
        fetchSubOrderData(order_id),
        fetchOrderBasicInfo(order_id)
      ]);

      setOrderData(orderInfo);
      setSubOrderData(subOrders);
      setOrderBasicInfo(basicInfo);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderInfo = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>加载订单信息中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>加载失败: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.detailsCard}>
        {orderData.map((item, index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={[
              styles.detailValue,
              item.isLink && styles.detailValueLink
            ]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSubOrders = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>加载子订单信息中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>加载失败: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.subOrdersContainer}>
        {subOrderData.map((item, index) => (
          <View key={index} style={styles.subOrderCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{item.name}</Text>
            </View>

            <View style={styles.productDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>单价</Text>
                <Text style={styles.detailValue}>{item.unitPrice}</Text>
              </View>

              {item.sizes.map((size, sizeIndex) => (
                <View key={sizeIndex} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{size.size}</Text>
                  <Text style={styles.detailValue}>{size.quantity}</Text>
                </View>
              ))}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>总箱数</Text>
                <Text style={styles.detailValue}>{item.totalQuantity}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>总金额</Text>
                <Text style={[styles.detailValue, styles.totalAmount]}>{item.totalAmount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>完货时间</Text>
                <Text style={styles.detailValue}>{item.completionDate}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // 如果没有订单ID，显示提示信息
  if (!order_id && !loading) {
    return (
      <View style={styles.container}>
        <OrderHeader />
        <View style={styles.noOrderIdContainer}>
          <Text style={styles.noOrderIdText}>请输入订单ID</Text>
          <Text style={styles.noOrderIdSubText}>
            例如: IN25001101
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              setOrderId('IN25001101');
              setOrderBasicInfo(prev => ({ ...prev, orderNumber: 'IN25001101' }));
            }}
          >
            <Text style={styles.testButtonText}>使用测试订单ID (IN25001101)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 如果正在获取URL参数，显示加载状态
  if (loading && !order_id) {
    return (
      <View style={styles.container}>
        <OrderHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>正在获取订单信息...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <OrderHeader />

        {/* Order Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIconContainer}>
              <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>{orderBasicInfo.orderNumber}</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.orderStatus}>{orderBasicInfo.status}</Text>
              </View>
            </View>
            <Text style={styles.orderAmount}>{orderBasicInfo.amount}</Text>
          </View>
        </View>

        {/* Tab Indicator */}
        <View style={styles.tabIndicator}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'info' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              订单信息
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'suborders' && styles.activeTab]}
            onPress={() => setActiveTab('suborders')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'suborders' ? styles.activeTabText : styles.inactiveTabText
            ]}>
              子订单列表 ({subOrderData.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'info' ? renderOrderInfo() : renderSubOrders()}
        </View>
      </ScrollView>

      {/* Sticky Bottom Buttons - Three in a row */}
      {/* <View style={styles.stickyButtonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonText}>NC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonText}>竞意</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonText}>TMS</Text>
          </TouchableOpacity>
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  scrollContent: {
    paddingBottom: 100, // Space for sticky buttons
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: height * 0.01,        // 屏幕高度的3%
    paddingHorizontal: width * 0.05,  // 屏幕宽度的5%
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIconContainer: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderStatus: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  tabIndicator: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  inactiveTabText: {
    color: '#6B7280',
  },
  contentContainer: {
    marginTop: 12,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
  },
  detailValueLink: {
    color: '#2563EB',
  },
  subOrdersContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  subOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  productDetails: {
    gap: 12,
  },
  totalAmount: {
    fontWeight: '600',
    color: '#2563EB',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  noOrderIdContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noOrderIdText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  noOrderIdSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E9E9E7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});