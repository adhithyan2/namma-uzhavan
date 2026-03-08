import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { api } from '../services/api';

export default function MarketplaceScreen() {
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', type: 'sell' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data.slice(0, 20));
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      await api.addProduct({ ...newProduct, price: Number(newProduct.price) });
      setShowAdd(false);
      setNewProduct({ name: '', price: '', quantity: '', type: 'sell' });
      loadProducts();
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImage}>
        <Text style={styles.productEmoji}>🌾</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        {item.quantity && <Text style={styles.productQty}>Qty: {item.quantity}</Text>}
      </View>
      <TouchableOpacity style={styles.contactBtn}>
        <Text style={styles.contactBtnText}>Contact</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Marketplace</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}><Text style={styles.tabText}>All</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Seeds</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Fertilizers</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>Tools</Text></TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Product</Text>
            <TextInput style={styles.modalInput} placeholder="Product Name" value={newProduct.name} onChangeText={(v) => setNewProduct({...newProduct, name: v})} />
            <TextInput style={styles.modalInput} placeholder="Price (₹)" value={newProduct.price} onChangeText={(v) => setNewProduct({...newProduct, price: v})} keyboardType="numeric" />
            <TextInput style={styles.modalInput} placeholder="Quantity" value={newProduct.quantity} onChangeText={(v) => setNewProduct({...newProduct, quantity: v})} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={addProduct}><Text style={styles.submitBtnText}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#10b981' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  addBtn: { backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  addBtnText: { color: '#10b981', fontWeight: 'bold' },
  tabs: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
  tab: { paddingHorizontal: 15, paddingVertical: 8, marginRight: 5, borderRadius: 20 },
  tabActive: { backgroundColor: '#10b981' },
  tabText: { color: '#333' },
  list: { padding: 10 },
  productCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 30 },
  productInfo: { flex: 1, marginLeft: 15 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  productQty: { color: '#666', fontSize: 12 },
  contactBtn: { backgroundColor: '#10b981', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8 },
  contactBtnText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 12, flex: 1, alignItems: 'center' },
  submitBtn: { backgroundColor: '#10b981', padding: 12, flex: 1, alignItems: 'center', borderRadius: 10 },
  submitBtnText: { color: 'white', fontWeight: 'bold' }
});
