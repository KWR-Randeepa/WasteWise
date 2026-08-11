import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { BASE_URL } from '../config';

const REWARDS_LIST = [
  {
    id: '1',
    name: '$5 Grocery Voucher',
    description: 'Valid at all major supermarkets for fresh produce.',
    cost: 15,
    emoji: '🛒',
    color: 'bg-orange-500'
  },
  {
    id: '2',
    name: 'Free Bus Ride Ticket',
    description: 'One-way transit pass to encourage green public transport.',
    cost: 20,
    emoji: '🚌',
    color: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Plant a Tree',
    description: 'We will plant a native tree on your behalf to offset carbon.',
    cost: 10,
    emoji: '🌳',
    color: 'bg-emerald-500'
  },
  {
    id: '4',
    name: 'Eco Cotton Tote Bag',
    description: 'Reusable waste-free canvas bag for your daily shopping.',
    cost: 30,
    emoji: '🛍️',
    color: 'bg-yellow-600'
  }
];

export default function RewardScreen({ route, navigation }) {
  const user = route.params?.user;
  
  const [userPoints, setUserPoints] = useState(user?.points || 0);
  const [activeTab, setActiveTab] = useState('redeem'); // 'redeem' or 'history'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  
  // Voucher Modal State
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [claimCode, setClaimCode] = useState('');

  // Fetch updated user points in case they changed
  useEffect(() => {
    const fetchPoints = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${BASE_URL}/auth/profile/${user.id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setUserPoints(data.user.points || 0);
        }
      } catch (err) {
        console.error("Failed to fetch points:", err);
      }
    };
    fetchPoints();
  }, [user]);

  // Fetch waste report points history
  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${BASE_URL}/waste/user/${user.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleRedeem = async (reward) => {
    if (userPoints < reward.cost) {
      Alert.alert("Insufficient Points", `You need ${reward.cost - userPoints} more points to redeem this item.`);
      return;
    }

    Alert.alert(
      "Confirm Redemption",
      `Are you sure you want to spend ${reward.cost} points on ${reward.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem",
          onPress: async () => {
            setRedeeming(true);
            try {
              const res = await fetch(`${BASE_URL}/auth/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  rewardName: reward.name,
                  pointsCost: reward.cost
                })
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setUserPoints(data.points);
                setClaimCode(data.claimCode);
                setRedeemedReward(reward);
                setVoucherModalVisible(true);
              } else {
                Alert.alert("Redemption Failed", data.error || "Something went wrong.");
              }
            } catch (err) {
              console.error(err);
              Alert.alert("Network Error", "Could not connect to server.");
            } finally {
              setRedeeming(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return d.toLocaleDateString(undefined, options);
    } catch (e) {
      return '';
    }
  };

  const renderRewardItem = ({ item }) => {
    const canAfford = userPoints >= item.cost;
    return (
      <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-sm flex-row items-center">
        <View className={`w-14 h-14 rounded-2xl justify-center items-center mr-4 ${item.color} shadow-sm`}>
          <Text className="text-3xl">{item.emoji}</Text>
        </View>
        <View className="flex-1 mr-2">
          <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
          <Text className="text-gray-500 text-xs mt-0.5 leading-4">{item.description}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-emerald-600 font-bold text-sm">⭐ {item.cost} pts</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleRedeem(item)}
          disabled={redeeming}
          className={`px-4 py-2.5 rounded-xl justify-center items-center ${
            canAfford ? 'bg-emerald-500' : 'bg-gray-200'
          }`}
        >
          <Text className={`font-bold text-sm ${canAfford ? 'text-white' : 'text-gray-400'}`}>
            Redeem
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getWasteEmoji = (type) => {
    switch (type) {
      case 'organic': return '🍏';
      case 'hazardous': return '⚠️';
      default: return '🥤';
    }
  };

  const renderHistoryItem = ({ item }) => {
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-emerald-50 rounded-full justify-center items-center mr-3">
            <Text className="text-2xl">{getWasteEmoji(item.wasteType)}</Text>
          </View>
          <View>
            <Text className="font-bold text-gray-800 capitalize">
              {item.wasteType === 'hazardous' ? 'Hazardous' : `${item.wasteType} Waste`}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5 capitalize">{item.wasteSize} bag • {formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View className="bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
          <Text className="text-emerald-700 font-bold text-xs">+{item.pointsEarned || 0} pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Top Banner Card */}
      <View className="mx-6 mt-4 mb-6 bg-emerald-600 rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <View className="z-10">
          <Text className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Eco Balance</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white text-5xl font-black">{userPoints}</Text>
            <Text className="text-emerald-100 text-lg font-bold ml-2">EcoPoints</Text>
          </View>
          <Text className="text-emerald-100 text-sm mt-3 opacity-90">
            Keep reporting waste to accumulate points and redeem premium sustainable items! 🌱
          </Text>
        </View>
        <View className="absolute right-0 bottom-[-10] opacity-10">
          <Text className="text-9xl">🏆</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-6 mb-4 bg-gray-200/60 p-1.5 rounded-2xl">
        <TouchableOpacity 
          onPress={() => setActiveTab('redeem')}
          className={`flex-1 py-3 rounded-xl justify-center items-center ${
            activeTab === 'redeem' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Text className={`font-bold text-sm ${activeTab === 'redeem' ? 'text-emerald-700' : 'text-gray-500'}`}>
            🎁 Rewards Shop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert("Coming Soon", "This feature will be available soon.");
          }}
          className={`flex-1 py-3 rounded-xl justify-center items-center ${
            activeTab === 'history' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Text className={`font-bold text-sm ${activeTab === 'history' ? 'text-emerald-700' : 'text-gray-500'}`}>
            📜 Points History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6">
        {activeTab === 'redeem' ? (
          <FlatList
            data={REWARDS_LIST}
            keyExtractor={(item) => item.id}
            renderItem={renderRewardItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ pb: 20 }}
          />
        ) : (
          <View className="flex-1">
            {loadingHistory ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item._id}
                renderItem={renderHistoryItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ pb: 20 }}
                ListEmptyComponent={
                  <View className="flex-1 py-12 justify-center items-center">
                    <Text className="text-5xl mb-4">🌱</Text>
                    <Text className="text-gray-700 font-bold text-lg">No points history</Text>
                    <Text className="text-gray-500 text-sm mt-1 text-center px-6 leading-5">
                      Your waste report records will appear here. Start reporting waste on the Dashboard to earn your first points!
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Voucher Code Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={voucherModalVisible}
        onRequestClose={() => setVoucherModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white w-full rounded-3xl p-6 items-center shadow-xl border border-gray-100">
            <Text className="text-5xl mb-3">🎉</Text>
            <Text className="text-gray-800 font-bold text-2xl mb-1 text-center">Reward Redeemed!</Text>
            <Text className="text-gray-500 text-sm mb-6 text-center leading-5">
              Show this claim code to local waste officers or partner stores to get your reward:
            </Text>
            
            <View className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl w-full py-4 items-center mb-6">
              <Text className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">VOUCHER CODE</Text>
              <Text className="text-emerald-700 font-black text-2xl tracking-widest">{claimCode}</Text>
            </View>

            <View className="w-full bg-gray-50 rounded-2xl p-4 mb-6 flex-row items-center">
              <Text className="text-3xl mr-3">{redeemedReward?.emoji}</Text>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">{redeemedReward?.name}</Text>
                <Text className="text-xs text-gray-500">{redeemedReward?.cost} EcoPoints Spent</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setVoucherModalVisible(false)}
              className="w-full h-14 bg-emerald-500 rounded-xl justify-center items-center shadow-md active:bg-emerald-600"
            >
              <Text className="text-white text-base font-bold">Awesome, Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
