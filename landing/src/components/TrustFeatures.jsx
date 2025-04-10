import React from 'react';
import { Truck, Shield, Phone, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-10 w-10" />,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 500K"
  },
  {
    icon: <Shield className="h-10 w-10" />,
    title: "Thanh toán an toàn",
    description: "Bảo mật 100%"
  },
  {
    icon: <Phone className="h-10 w-10" />,
    title: "Hỗ trợ 24/7",
    description: "Luôn sẵn sàng hỗ trợ"
  },
  {
    icon: <RefreshCw className="h-10 w-10" />,
    title: "Đổi trả dễ dàng",
    description: "Trong vòng 30 ngày"
  }
];

const TrustFeatures = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustFeatures; 