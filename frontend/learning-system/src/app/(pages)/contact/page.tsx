import { Phone, Mail } from "lucide-react";
import ContactForm from "./Contact";
import Link from "next/link";

export default function ContactPage() {
    return (
        <>
            {/* Breadcrumb */}
            <div className="border-b border-gray-200 pb-3">
                <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            Trang chủ
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">Liên hệ</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8 py-8">
                    <div className="w-full md:w-1/3">
                        <h2 className="text-2xl font-bold mb-4">Cần hỗ trợ trực tiếp?</h2>
                        <p className="text-gray-600 mb-6">
                            Nếu bạn cần trợ giúp hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua thông tin bên dưới.
                        </p>

                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                                <Phone className="text-orange-500 h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Số điện thoại</p>
                                <p className="font-medium">(123) 456 7890</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                                <Mail className="text-orange-500 h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Email</p>
                                <p className="font-medium">contact@khoahoconline.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Google Map Embed */}
                    <div className="w-full md:w-2/3 h-[300px] rounded-lg overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d119189.19871831515!2d105.76072903387036!3d21.006163370839783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x3135aca120613f6f%3A0x11aab8152a382220!2sTrung%20Ho%C3%A0!3m2!1d21.0101531!2d105.7988345!4m5!1s0x3135ac71294bf0ab%3A0xc7e2d20e5e04a9da!2zMSDEkC4gxJDhuqFpIEPhu5MgVmnhu4d0LCBCw6FjaCBLaG9hLCBIYWkgQsOgIFRyxrBuZywgSMOgIE7hu5lp!3m2!1d21.0061832!2d105.84313069999999!5e0!3m2!1svi!2s!4v1743107855530!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <ContactForm />
            </div>
        </>
    );
}
