'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Clock, ShieldCheck, Phone, MapPin, Eye, Edit } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string; // JSON String
  totalAmount: number;
  status: string;
  createdAt: any;
}

interface DashboardClientProps {
  initialOrders: Order[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Handle status update call
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // 1. Calculate Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    // Count paid revenue (anything not pending)
    const paidRevenue = orders
      .filter((o) => o.status !== 'PENDING')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const avgOrderValue = totalOrders > 0 ? paidRevenue / totalOrders : 0;

    return {
      totalOrders,
      paidRevenue,
      pendingOrders,
      avgOrderValue,
    };
  }, [orders]);

  // 2. Format Chart Data (last 7 days)
  const chartData = useMemo(() => {
    const dataMap: { [date: string]: number } = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dataMap[dateString] = 0;
    }

    // Accumulate revenue per day
    orders.forEach((o) => {
      if (o.status !== 'PENDING') {
        const orderDate = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dataMap[orderDate] !== undefined) {
          dataMap[orderDate] += o.totalAmount;
        }
      }
    });

    return Object.keys(dataMap).map((date) => ({
      date,
      Revenue: Number(dataMap[date].toFixed(2)),
    }));
  }, [orders]);

  // 3. Filter orders list
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Overview</h1>
        <p className="text-xs text-neutral-400 font-light mt-1 uppercase tracking-wider">
          WF GALAXY business metrics and order fulfillment
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <DollarSign className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Total Revenue</span>
            <span className="text-xl font-bold text-white">${metrics.paidRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Total Orders</span>
            <span className="text-xl font-bold text-white">{metrics.totalOrders}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Clock className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Pending Orders</span>
            <span className="text-xl font-bold text-white">{metrics.pendingOrders}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-lg flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <ShieldCheck className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Average Ticket</span>
            <span className="text-xl font-bold text-white">${metrics.avgOrderValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Revenue Graph Block */}
      <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-lg">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-6">
          Sales Performance (Last 7 Days)
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c2a278" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c2a278" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '4px' }}
                labelStyle={{ fontWeight: 'bold', color: '#c2a278', fontSize: '12px' }}
                itemStyle={{ color: '#ffffff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="Revenue" stroke="#c2a278" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
        {/* Table Filters Panel */}
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Order Fulfillment Queue
          </h2>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 border text-[10px] font-bold tracking-wider rounded-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-accent text-neutral-950 border-accent'
                    : 'bg-[#1c1c1a] hover:bg-neutral-850 border-neutral-850 text-neutral-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="p-20 text-center text-neutral-500">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#161614] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Garments</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Status & Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredOrders.map((order) => {
                  const items = JSON.parse(order.items) as any[];
                  return (
                    <tr key={order.id} className="hover:bg-neutral-900/30 transition-colors">
                      {/* Order info */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-white">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-neutral-500 block mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-semibold text-neutral-200">{order.customerName}</div>
                        <div className="flex items-center space-x-4 text-[11px] text-neutral-400 mt-1">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 text-accent mr-1 shrink-0" />
                            {order.customerPhone}
                          </span>
                          <span className="flex items-center max-w-[150px] truncate">
                            <MapPin className="h-3 w-3 text-accent mr-1 shrink-0" />
                            {order.customerAddress}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-4 max-w-xs">
                        <div className="text-xs space-y-0.5">
                          {items.map((i, idx) => (
                            <div key={idx} className="text-neutral-300">
                              {i.quantity}x {i.name}{' '}
                              <span className="text-neutral-500 text-[10px] font-bold">
                                ({i.size} / {i.color})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 whitespace-nowrap font-mono font-bold text-accent">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      {/* Status controls */}
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold rounded-sm border px-2 py-1 focus:outline-hidden ${
                            order.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : order.status === 'PAID'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : order.status === 'SHIPPED'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardClient;
