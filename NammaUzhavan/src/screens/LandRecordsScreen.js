import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { api } from '../services/api';

export default function LandRecordsScreen() {
  const [records, setRecords] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState({ surveyNo: '', area: '', village: '', district: '', owner: '' });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await api.getLandRecords();
      setRecords(data);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const addRecord = async () => {
    if (!newRecord.surveyNo) return;
    try {
      await api.addLandRecord(newRecord);
      setShowAdd(false);
      setNewRecord({ surveyNo: '', area: '', village: '', district: '', owner: '' });
      loadRecords();
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const renderRecord = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.surveyNo}>Survey No: {item.surveyNo}</Text>
        <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified</Text></View>
      </View>
      <View style={styles.recordDetails}>
        <Text style={styles.recordText}>📐 Area: {item.area} acres</Text>
        <Text style={styles.recordText}>📍 Village: {item.village}</Text>
        <Text style={styles.recordText}>🏛️ District: {item.district}</Text>
        <Text style={styles.recordText}>👤 Owner: {item.owner}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Land Records</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No land records found</Text>}
      />

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Land Record</Text>
            <TextInput style={styles.modalInput} placeholder="Survey Number *" value={newRecord.surveyNo} onChangeText={(v) => setNewRecord({...newRecord, surveyNo: v})} />
            <TextInput style={styles.modalInput} placeholder="Area (acres)" value={newRecord.area} onChangeText={(v) => setNewRecord({...newRecord, area: v})} />
            <TextInput style={styles.modalInput} placeholder="Village" value={newRecord.village} onChangeText={(v) => setNewRecord({...newRecord, village: v})} />
            <TextInput style={styles.modalInput} placeholder="District" value={newRecord.district} onChangeText={(v) => setNewRecord({...newRecord, district: v})} />
            <TextInput style={styles.modalInput} placeholder="Owner Name" value={newRecord.owner} onChangeText={(v) => setNewRecord({...newRecord, owner: v})} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={addRecord}><Text style={styles.submitBtnText}>Save</Text></TouchableOpacity>
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
  list: { padding: 15 },
  recordCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  surveyNo: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  verifiedBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  verifiedText: { color: '#4caf50', fontSize: 12, fontWeight: 'bold' },
  recordDetails: {},
  recordText: { color: '#666', marginTop: 5 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 12, flex: 1, alignItems: 'center' },
  submitBtn: { backgroundColor: '#10b981', padding: 12, flex: 1, alignItems: 'center', borderRadius: 10 },
  submitBtnText: { color: 'white', fontWeight: 'bold' }
});
