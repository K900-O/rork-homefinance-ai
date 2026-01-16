import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Mail,
  DollarSign,
  Users,
  Target,
  Shield,
  LogOut,
  ChevronRight,
  Edit3,
  Check,
  X,
  Wallet,
  TrendingUp,
  Award,
  Settings,
  Globe,
  HelpCircle,
  FileText,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { useFinance } from '@/contexts/FinanceContext';
import { useAppMode } from '@/contexts/AppModeContext';

import { fontFamily } from '@/constants/Typography';
import { router } from 'expo-router';
import type { RiskTolerance } from '@/constants/types';
import { BlueGlow } from '@/components/BlueGlow';

const RISK_OPTIONS: { value: RiskTolerance; label: string; description: string }[] = [
  { value: 'conservative', label: 'Conservative', description: 'Low risk, stable returns' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced approach' },
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential' },
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'JD', 'AED', 'SAR'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser, logout, financialSummary, transactions, totalRewardPoints } = useFinance();
  const { toggleMode, isFinancialMode } = useAppMode();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be cleared from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/landing');
          },
        },
      ]
    );
  }, [logout]);

  const openEditModal = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'Please enter a valid value');
      return;
    }

    let updates: Record<string, string | number> = {};
    
    switch (editField) {
      case 'name':
        updates = { name: editValue.trim() };
        break;
      case 'email':
        updates = { email: editValue.trim() };
        break;
      case 'monthlyIncome':
        const income = parseFloat(editValue);
        if (isNaN(income) || income < 0) {
          Alert.alert('Error', 'Please enter a valid income amount');
          return;
        }
        updates = { monthlyIncome: income };
        break;
      case 'householdSize':
        const size = parseInt(editValue);
        if (isNaN(size) || size < 1) {
          Alert.alert('Error', 'Please enter a valid household size');
          return;
        }
        updates = { householdSize: size };
        break;
      case 'currency':
        updates = { currency: editValue };
        break;
      case 'riskTolerance':
        updates = { riskTolerance: editValue as RiskTolerance };
        break;
    }

    const success = await updateUser(updates);
    if (success) {
      setShowEditModal(false);
      console.log('Profile updated:', updates);
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  const totalTransactions = transactions.length;
  

  return (
    <View style={styles.container}>
      <BlueGlow />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings color="#A1A1AA" size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <LinearGradient
            colors={['#18181B', '#09090B']}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarSection}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Edit3 color="#FFF" size={14} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
              <View style={styles.memberBadge}>
                <Calendar size={12} color="#10B981" />
                <Text style={styles.memberText}>Member since {memberSince}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Wallet size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{financialSummary.balance.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <TrendingUp size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{totalTransactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Award size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{totalRewardPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openEditModal('name', user?.name || '')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <User size={18} color="#6366F1" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>Name</Text>
                  <Text style={styles.menuValue}>{user?.name || 'Not set'}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openEditModal('email', user?.email || '')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Mail size={18} color="#EC4899" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>Email</Text>
                  <Text style={styles.menuValue}>{user?.email || 'Not set'}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openEditModal('monthlyIncome', user?.monthlyIncome?.toString() || '')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <DollarSign size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>Monthly Income</Text>
                  <Text style={styles.menuValue}>
                    {user?.monthlyIncome?.toLocaleString() || '0'} {user?.currency || 'USD'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openEditModal('householdSize', user?.householdSize?.toString() || '')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Users size={18} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>Household Size</Text>
                  <Text style={styles.menuValue}>{user?.householdSize || 1} {user?.householdSize === 1 ? 'person' : 'people'}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openEditModal('currency', user?.currency || 'USD')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Globe size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>Currency</Text>
                  <Text style={styles.menuValue}>{user?.currency || 'USD'}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => openEditModal('riskTolerance', user?.riskTolerance || 'moderate')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Shield size={18} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.menuLabel}>Risk Tolerance</Text>
                  <Text style={styles.menuValue}>
                    {user?.riskTolerance ? user.riskTolerance.charAt(0).toUpperCase() + user.riskTolerance.slice(1) : 'Moderate'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={toggleMode}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: isFinancialMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)' }]}>
                  <Sparkles size={18} color={isFinancialMode ? '#10B981' : '#8B5CF6'} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>App Mode</Text>
                  <Text style={styles.menuValue}>{isFinancialMode ? 'Financial' : 'Personal'}</Text>
                </View>
              </View>
              <View style={[styles.modeBadge, isFinancialMode ? styles.financialBadge : styles.personalBadge]}>
                <Text style={[styles.modeBadgeText, isFinancialMode ? styles.financialText : styles.personalText]}>
                  Switch
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals</Text>
            
            {user?.primaryGoals && user.primaryGoals.length > 0 ? (
              <View style={styles.goalsContainer}>
                {user.primaryGoals.map((goal, index) => (
                  <View key={index} style={styles.goalTag}>
                    <Target size={12} color="#10B981" />
                    <Text style={styles.goalTagText}>{goal}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyGoals}>
                <Target size={24} color="#52525B" />
                <Text style={styles.emptyGoalsText}>No goals set</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <HelpCircle size={18} color="#6366F1" />
                </View>
                <Text style={styles.menuLabel}>Help Center</Text>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(161, 161, 170, 0.15)' }]}>
                  <FileText size={18} color="#A1A1AA" />
                </View>
                <Text style={styles.menuLabel}>Terms & Privacy</Text>
              </View>
              <ChevronRight size={20} color="#52525B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>

        <Modal
          visible={showEditModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Edit {editField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <X size={24} color="#A1A1AA" />
                </TouchableOpacity>
              </View>

              {editField === 'currency' ? (
                <View style={styles.optionsContainer}>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={[
                        styles.optionButton,
                        editValue === currency && styles.optionButtonActive
                      ]}
                      onPress={() => setEditValue(currency)}
                    >
                      <Text style={[
                        styles.optionText,
                        editValue === currency && styles.optionTextActive
                      ]}>
                        {currency}
                      </Text>
                      {editValue === currency && <Check size={16} color="#10B981" />}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : editField === 'riskTolerance' ? (
                <View style={styles.optionsContainer}>
                  {RISK_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.riskOption,
                        editValue === option.value && styles.riskOptionActive
                      ]}
                      onPress={() => setEditValue(option.value)}
                    >
                      <View style={styles.riskOptionContent}>
                        <Text style={[
                          styles.riskOptionLabel,
                          editValue === option.value && styles.riskOptionLabelActive
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.riskOptionDescription}>{option.description}</Text>
                      </View>
                      {editValue === option.value && <Check size={18} color="#10B981" />}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.modalInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={`Enter ${editField}`}
                  placeholderTextColor="#52525B"
                  keyboardType={editField === 'monthlyIncome' || editField === 'householdSize' ? 'numeric' : 'default'}
                  autoCapitalize={editField === 'email' ? 'none' : 'words'}
                  autoFocus
                />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#27272A',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily,
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 12,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  memberText: {
    fontFamily,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily,
    fontSize: 11,
    color: '#71717A',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#A1A1AA',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  menuValue: {
    fontFamily,
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  financialBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  personalBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  modeBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  financialText: {
    color: '#10B981',
  },
  personalText: {
    color: '#8B5CF6',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalTagText: {
    fontFamily,
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  emptyGoals: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 8,
  },
  emptyGoalsText: {
    fontFamily,
    fontSize: 14,
    color: '#52525B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  versionText: {
    fontFamily,
    fontSize: 12,
    color: '#52525B',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  optionButtonActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionText: {
    fontFamily,
    fontSize: 16,
    color: '#A1A1AA',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  riskOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  riskOptionActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  riskOptionContent: {
    flex: 1,
  },
  riskOptionLabel: {
    fontFamily,
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 2,
  },
  riskOptionLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  riskOptionDescription: {
    fontFamily,
    fontSize: 12,
    color: '#71717A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#A1A1AA',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
  },
});
