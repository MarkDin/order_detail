import {
    FieldMappingConfig,
    OrderDisplayItem,
    OrderResponse,
    SubOrderDisplayItem,
    SubOrderResponse
} from '@/types';

// 导入字段映射配置
import fieldMapping from '@/field_mapping.json';

const config = fieldMapping as FieldMappingConfig;

// 获取订单详情数据
export async function fetchOrderData(orderId: string): Promise<OrderDisplayItem[]> {
    try {
        const response = await fetch(`${config.order.request_url}${orderId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OrderResponse = await response.json();

        if (!data.success) {
            throw new Error(data.error_msg || '获取订单数据失败');
        }

        // 获取订单数据
        const orderData = data.data.result_map[orderId];
        if (!orderData) {
            throw new Error('未找到订单数据');
        }

        // 转换为UI显示格式
        const displayItems: OrderDisplayItem[] = [];

        // 根据field_mapping配置转换数据
        Object.entries(config.order.fields).forEach(([fieldKey, fieldConfig]) => {
            let value = '';

            // 字段映射关系
            switch (fieldKey) {
                case 'projectId':
                    value = orderData.orderNo?.value || '';
                    break;
                case 'custShortName':
                    value = orderData.custShortName?.value || '';
                    break;
                case 'responsibleSales':
                    value = orderData.salesperson?.value || '';
                    break;
                case 'orderCountry':
                    value = orderData.country?.value || '';
                    break;
                case 'factory':
                    value = orderData.deliveryFactory?.value || '';
                    break;
                case 'signingCountry':
                    // 这个字段在API中没有对应，使用默认值或从其他字段推导
                    value = ''; // FIXME: 需要确认这个字段的数据来源
                    break;
                case 'containerQuantity':
                    value = orderData.quantityOnHand?.value || '';
                    break;
                case 'crd':
                    value = orderData.custRequestDate?.value || '';
                    break;
                case 'deliveryData':
                    value = orderData.deliveryDate?.value || '';
                    break;
                case 'etd':
                    value = orderData.etd?.value || '';
                    break;
                case 'eta':
                    value = orderData.eta?.value || '';
                    break;
                default:
                    value = '';
            }

            if (value) {
                displayItems.push({
                    label: fieldConfig.label,
                    value: value,
                    isLink: fieldConfig.isLink
                });
            }
        });

        return displayItems;
    } catch (error) {
        console.error('获取订单数据失败:', error);
        throw error;
    }
}

// 获取子订单数据
export async function fetchSubOrderData(orderId: string): Promise<SubOrderDisplayItem[]> {
    try {
        const response = await fetch(`${config.subOrder.request_url}${orderId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SubOrderResponse = await response.json();

        if (!data.success) {
            throw new Error(data.error_msg || '获取子订单数据失败');
        }

        // 转换为UI显示格式
        const displayItems: SubOrderDisplayItem[] = data.data.result_list.map(item => {
            // 构建尺寸数组
            const sizes = [];

            if (item.sModelBoxCount?.value) {
                sizes.push({
                    size: 'S (箱数)',
                    quantity: item.sModelBoxCount.value
                });
            }

            if (item.mModelBoxCount?.value) {
                sizes.push({
                    size: 'M (箱数)',
                    quantity: item.mModelBoxCount.value
                });
            }

            if (item.lModelBoxCount?.value) {
                sizes.push({
                    size: 'L (箱数)',
                    quantity: item.lModelBoxCount.value
                });
            }

            if (item.xlModelBoxCount?.value) {
                sizes.push({
                    size: 'XL (箱数)',
                    quantity: item.xlModelBoxCount.value
                });
            }

            if (item.xxlModelBoxCount?.value) {
                sizes.push({
                    size: 'XXL (箱数)',
                    quantity: item.xxlModelBoxCount.value
                });
            }

            // 计算总金额 (箱单价 * 总箱数)
            const boxPrice = parseFloat(item.boxPrice?.value?.replace(':', '') || '0');
            const totalBoxCount = parseInt(item.totalBoxCount?.value || '0');
            const totalAmount = boxPrice * totalBoxCount;

            return {
                name: item.description?.value || '',
                unitPrice: item.boxPrice?.value ? `$${item.boxPrice.value.replace(':', '')}` : '$0',
                sizes: sizes,
                totalQuantity: item.totalBoxCount?.value || '0',
                totalAmount: `$${totalAmount.toLocaleString()}`,
                completionDate: item.planEndTime?.value ?
                    new Date(item.planEndTime.value).toLocaleDateString('zh-CN') : ''
            };
        });

        return displayItems;
    } catch (error) {
        console.error('获取子订单数据失败:', error);
        throw error;
    }
}

// 获取订单基本信息（用于头部显示）
export async function fetchOrderBasicInfo(orderId: string) {
    try {
        const response = await fetch(`${config.order.request_url}${orderId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OrderResponse = await response.json();

        if (!data.success) {
            throw new Error(data.error_msg || '获取订单基本信息失败');
        }

        const orderData = data.data.result_map[orderId];
        if (!orderData) {
            throw new Error('未找到订单数据');
        }

        return {
            orderNumber: orderData.orderNo?.value || orderId,
            status: orderData.publicSeaPoolStatus?.value || '未知状态',
            amount: orderData.debitamount?.value ?
                `$${parseInt(orderData.debitamount.value).toLocaleString()}` : '$0'
        };
    } catch (error) {
        console.error('获取订单基本信息失败:', error);
        throw error;
    }
} 