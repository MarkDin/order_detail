// API响应的基础字段类型
export interface ApiField {
    value: string | null;
    systemName: string;
    source: string;
}

// 订单详情API响应类型
export interface OrderResponse {
    error_msg: string;
    data: {
        result_map: {
            [orderNo: string]: {
                orderNo: ApiField;
                custShortName: ApiField;
                materialIndex: ApiField;
                debitamount: ApiField;
                incomeName: ApiField;
                quantityOnHand: ApiField;
                salesperson: ApiField;
                deliveryFactory: ApiField;
                custRequestDate: ApiField;
                deliveryDate: ApiField;
                boxOrNot: ApiField;
                plannedStartTime: ApiField;
                planEndTime: ApiField;
                bookingStatus: ApiField;
                etd: ApiField;
                eta: ApiField;
                loadDate: ApiField;
                needShipment: ApiField;
                customerCode: ApiField;
                custName: ApiField;
                country: ApiField;
                publicSea: ApiField;
                publicSeaPoolStatus: ApiField;
                paymentPeriod: ApiField;
                collectionAgreement: ApiField;
                estimatedRecoveryTime: ApiField;
                isDraft: ApiField;
            };
        };
    };
    success: boolean;
}

// 子订单API响应类型
export interface SubOrderResponse {
    error_msg: string;
    data: {
        result_list: SubOrderItem[];
    };
    success: boolean;
}

export interface SubOrderItem {
    orderNo: ApiField;
    materialIndex: ApiField;
    model: ApiField;
    boxCount: ApiField;
    boxPrice: ApiField;
    description: ApiField;
    sModelBoxCount: ApiField;
    mModelBoxCount: ApiField;
    lModelBoxCount: ApiField;
    xlModelBoxCount: ApiField;
    xxlModelBoxCount: ApiField;
    totalBoxCount: ApiField;
    planEndTime: ApiField;
}

// UI显示用的订单数据类型
export interface OrderDisplayItem {
    label: string;
    value: string;
    isLink?: boolean;
}

// UI显示用的子订单数据类型
export interface SubOrderDisplayItem {
    name: string;
    unitPrice: string;
    sizes: Array<{
        size: string;
        quantity: string;
    }>;
    totalQuantity: string;
    totalAmount: string;
    completionDate: string;
}

// 字段映射配置类型
export interface FieldMappingConfig {
    order: {
        fields: {
            [key: string]: {
                label: string;
                isLink?: boolean;
            };
        };
        request_url: string;
    };
    subOrder: {
        fields: {
            [key: string]: {
                label: string;
                isLink?: boolean;
            };
        };
        request_url: string;
    };
} 