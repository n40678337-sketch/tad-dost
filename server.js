const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let orders = [];

app.get('/customer', (req, res) => res.sendFile(__dirname + '/customer.html'));
app.get('/courier', (req, res) => res.sendFile(__dirname + '/courier.html'));

io.on('connection', (socket) => {
  socket.on('new-order', (orderData) => {
    const order = { id: Date.now().toString(), ...orderData, status: 'нове', created: new Date().toISOString() };
    orders.push(order);
    io.emit('orders-updated', orders);
    socket.emit('order-confirmed', { orderId: order.id });
  });
  socket.on('get-orders', () => socket.emit('orders-updated', orders));
  socket.on('update-status', ({ orderId, newStatus }) => {
    const order = orders.find(o => o.id === orderId);
    if (order) { order.status = newStatus; io.emit('orders-updated', orders); }
  });
  socket.on('delete-order', ({ orderId }) => {
    orders = orders.filter(o => o.id !== orderId);
    io.emit('orders-updated', orders);
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Сервер запущено'));
