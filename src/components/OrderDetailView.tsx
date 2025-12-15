import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Icons } from './ui/icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { generateInvoicePDF } from '../utils/pdf/generator';

interface OrderDetailViewProps {
  orderId: string;
  orders: any[];
  onBack: () => void;
}

export function OrderDetailView({ orderId, orders, onBack }: OrderDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Find the order from the orders array
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested order could not be found.</p>
        <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Icons.ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  // Mock detailed order data based on the order
  const orderDetail = {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      avatar: '',
      personalDetails: {
        birthDate: '09/10/2003',
        maritalStatus: 'Married',
        marriageDate: '01/07/2023',
        age: '23',
        address: '123 MG Road, Mumbai, Maharashtra'
      }
    },
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    dealer: order.assignedTo,
    product: {
      name: order.items[0]?.name || 'Jewelry Item',
      metalType: '22K Gold',
      netWeight: '48.3 grams',
      stones: 'Uncut Diamond, Emerald',
      purity: '916 Hallmark',
      makingCharges: `₹${(order.totalAmount * 0.1).toLocaleString()}`,
      totalCharges: `₹${order.totalAmount.toLocaleString()}`,
      notes: order.notes || 'Customer requested antique finish and adjustable lock.'
    },
    attachments: [
      { id: '1', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop', alt: 'Product sample 1' },
      { id: '2', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop', alt: 'Product sample 2' }
    ],
    payment: {
      totalOrderValue: `₹${order.totalAmount.toLocaleString()}`,
      advancePaid: `₹${order.paidAmount.toLocaleString()}`,
      kediumCharges: `₹${order.paidAmount.toLocaleString()}`,
      balanceDue: `₹${(order.totalAmount - order.paidAmount).toLocaleString()}`,
      paymentMethod: 'UPI / Bank Transfer / Cash'
    },
    timeline: [
      { date: order.orderDate, status: 'Order Placed', completed: true },
      { date: order.orderDate, status: 'Payment Received', completed: order.paidAmount > 0 },
      { date: '2024-01-12', status: 'In Production', completed: ['In Production', 'Ready', 'Delivered'].includes(order.status) },
      { date: '2024-01-20', status: 'Quality Check', completed: ['Ready', 'Delivered'].includes(order.status) },
      { date: order.expectedDelivery, status: 'Ready for Delivery', completed: order.status === 'Delivered' },
    ]
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Production': 'bg-orange-100 text-orange-800 border-orange-200',
      'Ready': 'bg-green-100 text-green-800 border-green-200',
      'Delivered': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Advance Paid': 'bg-blue-100 text-blue-800 border-blue-200',
      'Partial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pending': 'bg-orange-100 text-orange-800 border-orange-200',
      'Overdue': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      'Pending': 'Clock',
      'Confirmed': 'CheckCircle',
      'In Production': 'Package',
      'Ready': 'CheckCircle',
      'Delivered': 'CheckCircle',
      'Cancelled': 'AlertCircle'
    };
    const iconName = iconMap[status as keyof typeof iconMap] || 'Clock';
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Icons.Circle className="w-4 h-4" />;
  };

  const calculateProgress = () => {
    const completedSteps = orderDetail.timeline.filter(step => step.completed).length;
    return (completedSteps / orderDetail.timeline.length) * 100;
  };

  const handleExportPDF = () => {
    try {
      generateInvoicePDF(orderDetail);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could add a toast notification here for user feedback
    }
  };

  const openWhatsApp = (phoneNumber: string, message: string) => {
    if (!phoneNumber) return;
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendReportToCustomer = async () => {
    try {
      // Generate PDF blob instead of downloading
      const pdfBlob = await generateInvoicePDF(orderDetail, true); // true for returning blob
      
      if (orderDetail.customer.phone) {
        const message = `📦 Order Update - ${orderDetail.orderNumber}

Dear ${orderDetail.customer.name},

Your jewelry order is progressing well! Here are the latest details:

🔹 Status: ${orderDetail.orderStatus}
🔹 Payment: ${orderDetail.paymentStatus}
🔹 Expected Delivery: ${orderDetail.timeline[orderDetail.timeline.length - 1].date}

💰 Payment Summary:
• Total: ${orderDetail.payment.totalOrderValue}
• Paid: ${orderDetail.payment.advancePaid}
• Balance: ${orderDetail.payment.balanceDue}

We'll attach the detailed report for your reference. Thank you for choosing MADHAVAN JEWELLERS!

Best regards,
MADHAVAN JEWELLERS Team`;

        // For now, we'll just open WhatsApp with the message
        // In a real implementation, you'd need to integrate with WhatsApp Business API
        // to send files programmatically
        openWhatsApp(orderDetail.customer.phone, message + "\n\n(Note: Detailed PDF report will be sent separately)");
        
        // Auto-download the PDF as well for manual sharing
        generateInvoicePDF(orderDetail);
      } else {
        alert('No phone number available for this customer');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">Order #{orderDetail.orderNumber}</h1>
                  <Badge className={`${getStatusColor(orderDetail.orderStatus)} border`}>
                    {getStatusIcon(orderDetail.orderStatus)}
                    <span className="ml-1">{orderDetail.orderStatus}</span>
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1">Complete order management and tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                📤
                <span className="ml-2">Share</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <Icons.Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              {orderDetail.customer.phone && (
                <Button 
                  size="sm" 
                  onClick={sendReportToCustomer}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icons.MessageSquare className="w-4 h-4 mr-2" />
                  Send Report via WhatsApp
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="text-gray-600 border-gray-300 hover:bg-gray-50">
                ✏️
                <span className="ml-2">{isEditing ? 'Save Changes' : 'Edit Order'}</span>
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                <Icons.MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Profile Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900">Customer Information</CardTitle>
                  <div className="flex items-center gap-2">
                    {orderDetail.customer.phone && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => openWhatsApp(orderDetail.customer.phone, `Hello ${orderDetail.customer.name}! 👋\n\nThis is regarding your jewelry order #${orderDetail.orderNumber}.\n\nHow can I assist you today?\n\nBest regards,\nGEMSTONE Fine Jewelry`)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Icons.MessageSquare className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(`tel:${orderDetail.customer.phone}`)}
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        >
                          <Icons.Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 ring-4 ring-primary/10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                        {orderDetail.customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Icons.CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{orderDetail.customer.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Icons.Mail className="w-4 h-4" />
                        <span className="text-sm">{orderDetail.customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.Phone className="w-4 h-4" />
                        <span className="text-sm">{orderDetail.customer.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-gray-600">
                      <Icons.MapPin className="w-4 h-4" />
                      <span className="text-sm">{orderDetail.customer.personalDetails.address}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    📅
                    <p className="text-xs text-gray-500 mt-1">Birth Date</p>
                    <p className="text-sm font-medium">{orderDetail.customer.personalDetails.birthDate}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Icons.User className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium">{orderDetail.customer.personalDetails.maritalStatus}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    ⏰
                    <p className="text-xs text-gray-500 mt-1">Age</p>
                    <p className="text-sm font-medium">{orderDetail.customer.personalDetails.age}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    ⭐
                    <p className="text-xs text-gray-500 mt-1">Marriage</p>
                    <p className="text-sm font-medium">{orderDetail.customer.personalDetails.marriageDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details Tabs */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      <Icons.Package className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="specifications" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      <Icons.Gem className="w-4 h-4 mr-2" />
                      Specs
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      📷
                      <span className="ml-2">Gallery</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product Name:</span>
                          <span className="font-medium text-gray-900">{orderDetail.product.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Metal Type:</span>
                          <span className="font-medium text-gray-900">{orderDetail.product.metalType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Net Weight:</span>
                          <span className="font-medium text-gray-900">{orderDetail.product.netWeight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned To:</span>
                          <span className="font-medium text-gray-900">{orderDetail.dealer}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stones:</span>
                          <span className="font-medium text-gray-900">{orderDetail.product.stones}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Purity:</span>
                          <span className="font-medium text-gray-900">{orderDetail.product.purity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Making Charges:</span>
                          <span className="font-medium text-gray-900">{orderDetail.product.makingCharges}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Charges:</span>
                          <span className="font-semibold text-primary text-lg">{orderDetail.product.totalCharges}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Icons.FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Special Notes</h4>
                          <p className="text-blue-800 text-sm mt-1">{orderDetail.product.notes}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        ⚖️
                        <h4 className="font-semibold text-yellow-900 mt-3">Weight</h4>
                        <p className="text-yellow-800 text-lg font-bold">{orderDetail.product.netWeight}</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <Icons.Gem className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-purple-900">Stones</h4>
                        <p className="text-purple-800 font-medium">{orderDetail.product.stones}</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        🎨
                        <h4 className="font-semibold text-green-900 mt-3">Purity</h4>
                        <p className="text-green-800 text-lg font-bold">{orderDetail.product.purity}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gallery" className="mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      {orderDetail.attachments.map((attachment) => (
                        <div key={attachment.id} className="relative group">
                          <ImageWithFallback
                            src={attachment.url}
                            alt={attachment.alt}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                              <Icons.Eye className="w-4 h-4 mr-2" />
                              View Full
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment & Status */}
          <div className="space-y-6">
            {/* Order Status & Progress */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Order Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>

                <div className="space-y-4">
                  {orderDetail.timeline.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? <Icons.CheckCircle className="w-4 h-4" /> : <Icons.Circle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.status}
                        </p>
                        <p className="text-xs text-gray-500">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900">Payment Details</CardTitle>
                  <Badge className={`${getPaymentStatusColor(orderDetail.paymentStatus)} border`}>
                    💳
                    <span className="ml-1">{orderDetail.paymentStatus}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Order Value:</span>
                    <span className="font-semibold text-gray-900">{orderDetail.payment.totalOrderValue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Advance Paid:</span>
                    <span className="font-medium text-green-600">{orderDetail.payment.advancePaid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Balance Due:</span>
                    <span className="font-semibold text-red-600">{orderDetail.payment.balanceDue}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">{orderDetail.payment.paymentMethod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderDetail.customer.phone && (
                  <Button 
                    onClick={sendReportToCustomer}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Icons.MessageSquare className="w-4 h-4 mr-2" />
                    Send Report via WhatsApp
                  </Button>
                )}
                <Button 
                  onClick={() => orderDetail.customer.phone && openWhatsApp(orderDetail.customer.phone, `Hello ${orderDetail.customer.name}! 👋\n\nYour order #${orderDetail.orderNumber} status has been updated to: ${orderDetail.orderStatus}\n\nWe'll keep you posted on any further progress.\n\nThank you for choosing MADHAVAN JEWELLERS!`)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!orderDetail.customer.phone}
                >
                  📩
                  <span className="ml-2">Send Update to Customer</span>
                </Button>
                <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                  📞
                  <span className="ml-2">Schedule Follow-up Call</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}