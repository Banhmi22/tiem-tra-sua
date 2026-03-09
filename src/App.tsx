import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Crown, Phone, Plus, Minus, X, ChevronRight, Cat, Rabbit, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

import { type Tea, useStoreData } from './store';

// ─── McCafé-style menu card ───────────────────────────────────────────────────
function MenuCard({ tea, index, onOpenOptions }: {
  tea: Tea;
  index: number;
  onOpenOptions: (tea: Tea) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ scale: 1.04, y: -6 }}
      className="relative flex flex-col items-center text-center
                 bg-white rounded-3xl shadow-md hover:shadow-2xl hover:shadow-pink-100
                 transition-shadow duration-300 overflow-visible cursor-pointer group w-full"
      style={{ paddingTop: '5rem', paddingBottom: '1.25rem', paddingLeft: '1rem', paddingRight: '1rem' }}
    >
      {/* Floating drink image – pops above card */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 drop-shadow-xl
                      group-hover:scale-110 transition-transform duration-300 pointer-events-none">
        <img src={tea.image} alt={tea.name} className="w-full h-full object-contain" />
      </div>

      {/* Animal badge */}
      <div className="absolute top-3 right-3 text-pink-300 group-hover:text-pink-500 transition-colors duration-300">
        {tea.animal === 'cat' ? <Cat className="w-4 h-4" /> : <Rabbit className="w-4 h-4" />}
      </div>

      {/* Name */}
      <h3 className="font-black text-lg text-stone-800 leading-tight mb-1">{tea.name}</h3>

      {/* Description */}
      <p className="text-xs text-stone-400 leading-relaxed mb-3 line-clamp-2 px-1">{tea.desc}</p>

      {/* Price — shows starting (S) price */}
      <p className="font-black text-xl text-stone-800 mb-4">
        <span className="text-base text-pink-500 mr-0.5">¥</span>{tea.prices['S']}
        <span className="text-xs font-medium text-stone-400 ml-1">起</span>
      </p>

      {/* Add button */}
      <button
        onClick={() => onOpenOptions(tea)}
        className="w-full py-2.5 rounded-full font-bold text-sm
                   bg-pink-50 text-pink-600 border border-pink-200
                   hover:bg-pink-500 hover:text-white hover:border-pink-500
                   active:scale-95 transition-all duration-200
                   flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> 加入购物车
      </button>
    </motion.div>
  );
}

// ─── Option picker modal ──────────────────────────────────────────────────────
const SUGARS = ['不加糖', '三分糖', '五分糖', '七分糖', '全糖'];

function OptionModal({ tea, onClose, onConfirm }: {
  tea: Tea;
  onClose: () => void;
  onConfirm: (item: any) => void;
}) {
  const [size, setSize]   = useState<string>('中');
  const [sugar, setSugar] = useState('全糖');
  const [temp, setTemp]   = useState('冰');

  const hasSugar = tea.sugarChoice === true;

  const priceMap: Record<string, number> = {
    '小': tea.prices.S,
    '中': tea.prices.M,
    '大': tea.prices.L,
  };
  const price = priceMap[size] ?? tea.prices.M;

  const handleConfirm = () => {
    onConfirm({
      teaId: tea.id,
      name: tea.name,
      size,
      temperature: tea.iceOnly ? '冰' : temp,
      sugar: hasSugar ? sugar : '',
      price,
      quantity: 1,
      animal: tea.animal,
    });
  };

  function PickerRow<T extends string>({
    label, options, value, onChange, sugarRow = false
  }: { label: string; options: T[]; value: T; onChange: (v: T) => void; sugarRow?: boolean }) {
    return (
      <div className="mb-5">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex flex-wrap gap-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                value === opt
                  ? sugarRow
                    ? 'bg-[#d84c6c] border-[#d84c6c] text-white shadow-md shadow-pink-200'
                    : 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200'
                  : sugarRow
                    ? 'bg-pink-50 border-pink-200 text-pink-600 hover:border-[#d84c6c] hover:text-[#d84c6c]'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-pink-300 hover:text-pink-600'
              }`}
            >
              {value === opt && <Check className="w-3 h-3" />}
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[65]"
      />
      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[66] p-0 md:p-6"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="relative bg-[#faf7f7] rounded-t-[2.5rem] md:rounded-[2.5rem] w-full md:max-w-md shadow-2xl overflow-hidden"
        >
          {/* Pink banner */}
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 pt-8 pb-16 px-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-white font-black text-2xl">{tea.name}</h3>
            <p className="text-pink-100 text-sm mt-0.5">{tea.desc}</p>
            <p className="text-white/70 text-xs mt-1.5 font-medium">
              {tea.iceOnly ? '🧊 仅限冰饮' : '☕ 可选热 / 冰'}
            </p>
          </div>

          {/* Floating image */}
          <div className="absolute top-4 right-6 w-28 h-28 drop-shadow-2xl pointer-events-none">
            <img src={tea.image} alt={tea.name} className="w-full h-full object-contain" />
          </div>

          {/* Pickers */}
          <div className="px-6 -mt-2 pb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 mb-4">
              <PickerRow label="尺寸 Size" options={['小', '中', '大']} value={size} onChange={setSize} />
              {/* 温度行 — 仅限冰饮时隐藏 */}
              {!tea.iceOnly && (
                <PickerRow label="温度 Temp" options={['热', '冰']} value={temp} onChange={setTemp} />
              )}
              {/* 糖度行 — 仅当 sugarChoice=true 时显示 */}
              {hasSugar && (
                <PickerRow label="糖度选择 Sugar" options={SUGARS} value={sugar} onChange={setSugar} sugarRow />
              )}
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black text-lg py-4 rounded-2xl
                         shadow-lg shadow-pink-200 active:scale-95 transition-all duration-200
                         flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              确认加入 — <span className="text-pink-100">¥{price}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

type CartItem = {
  cartId: string;
  teaId: string;
  name: string;
  size: string;
  temperature: string;
  sugar: string;
  price: number;
  quantity: number;
};

function App() {
  const { teas, storeOpen, loading } = useStoreData();
  const [closedToast, setClosedToast] = useState(false);
  const [optionTea, setOptionTea] = useState<Tea | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState('');

  // Guard: block cart when store is closed
  const handleOpenOptions = (tea: Tea) => {
    if (!storeOpen) {
      setClosedToast(true);
      setTimeout(() => setClosedToast(false), 3500);
      return;
    }
    setOptionTea(tea);
  };

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (newItem: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.teaId === newItem.teaId && item.size === newItem.size && item.temperature === newItem.temperature && item.sugar === newItem.sugar);
      if (existing) {
        return prev.map(item => item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...newItem, cartId: Math.random().toString(36).substr(2, 9) }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.cartId !== cartId || item.quantity + delta > 0));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      setFormError('请填写完整收货信息！🌸');
      return;
    }

    setIsSending(true);

    // Build cart summary
    const itemLines = cart.map(item =>
      `  • ${item.name} (${item.size === 'M' ? '中杯' : '大杯'}, ${item.temperature}, ${item.sugar}) x${item.quantity} — ¥${item.price * item.quantity}`
    ).join('\n');

    const message =
`🔔 CÓ ĐƠN HÀNG MỚI!

🧋 Sản phẩm:\n${itemLines}\n💰 Tổng: ¥${cartTotal}

📱 Số điện thoại: ${checkoutForm.phone}
📍 Địa chỉ: ${checkoutForm.address}
📝 Ghi chú: ${checkoutForm.notes || '(không có)'}`;

    try {
      // ⚠️ Token nằm ở frontend — chỉ dùng cho project nội bộ/demo
      await fetch(
        `https://api.telegram.org/bot8037702146:AAEWt415MBcZTBg1YZrvK8pGiP6snu61CCw/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: '-1003840379434',
            text: message,
          }),
        }
      );
    } catch (_) {
      // Gửi thất bại vẫn cho phép tiếp tục để không block khách
    }

    setIsSending(false);
    setIsCheckoutOpen(false);
    setIsOrderComplete(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fb7185', '#be123c', '#ffe4e6']
    });
    setCart([]);
    setCheckoutForm({ name: '', phone: '', address: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-pink-200 selection:text-pink-900 text-stone-800 overflow-x-hidden">

      {/* Closed-store toast notification */}
      <AnimatePresence>
        {closedToast && (
          <motion.div
            initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80]
                       bg-[#d84c6c] text-white text-sm font-black px-6 py-3.5 rounded-2xl
                       shadow-xl shadow-pink-400/40 text-center max-w-xs w-full mx-4"
          >
            🔴 店主在上课无法接单<br />
            <span className="font-normal text-white/80 text-xs">请一会再来，谢谢理解 🐱</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 w-full bg-white/80 backdrop-blur-xl border-b border-pink-100 shadow-sm z-40">
        <div className="w-full px-8 md:px-12 py-4 flex justify-start items-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-2 rounded-xl text-white shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-stone-800 bg-clip-text">
              Meww Tea <span className="text-pink-600 font-medium ml-1">逆逆奶茶店</span>
            </span>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6 max-w-6xl mx-auto">
        <section className="py-3 sm:py-5 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-pink-100 px-5 py-4 text-center max-w-xl mx-auto"
          >
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 mb-1 leading-tight tracking-tight">
              奶茶在手，
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-600">
                快乐我有
              </span> 🧋
            </h1>
            <p className="text-xs text-pink-600/80 max-w-sm mx-auto font-bold tracking-wide">
              请提前联系，上课时间无法接单，谢谢理解！
            </p>
          </motion.div>
        </section>

        {/* Menu Section */}
        <section className="py-12 md:py-16">
          {/* Animated cat decorations */}
          <div className="relative max-w-2xl mx-auto">

            {/* Cat 1 — sitting, left, ear wiggle */}
            <svg className="cat-float absolute -top-10 -left-6 w-14 h-14 pointer-events-none hidden sm:block"
                 style={{ color: '#d84c6c' }}
                 viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="30" cy="26" rx="16" ry="18" />
              <path className="cat-ear"  d="M18 15 Q15 4 24 9" />
              <path className="cat-ear-2" d="M42 15 Q45 4 36 9" />
              <ellipse className="cat-eye" cx="24" cy="24" rx="2.5" ry="2.5" fill="currentColor" stroke="none" />
              <ellipse className="cat-eye" cx="36" cy="24" rx="2.5" ry="2.5" fill="currentColor" stroke="none" />
              <path d="M27 30 Q30 32 33 30" />
              <ellipse cx="30" cy="54" rx="14" ry="18" />
              <path d="M16 66 Q10 74 18 72" />
              <path d="M44 66 Q50 74 42 72" />
            </svg>

            {/* Cat 2 — sleeping, right, tail wag */}
            <svg className="cat-float-2 absolute -top-8 -right-4 w-20 h-10 pointer-events-none hidden sm:block"
                 style={{ color: '#d84c6c' }}
                 viewBox="0 0 100 55" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="44" cy="32" rx="28" ry="16" />
              <path d="M20 24 Q15 12 24 16" />
              <path d="M68 24 Q73 12 64 16" />
              <line x1="36" y1="30" x2="30" y2="28" />
              <line x1="36" y1="33" x2="29" y2="33" />
              <line x1="52" y1="30" x2="58" y2="28" />
              <line x1="52" y1="33" x2="59" y2="33" />
              <path className="cat-tail" d="M72 34 Q82 28 88 38" />
            </svg>

            {/* Cat 3 — tiny peeking, bottom-right */}
            <svg className="cat-float-3 absolute -bottom-8 right-10 w-10 h-10 opacity-90 pointer-events-none"
                 style={{ color: '#d84c6c' }}
                 viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="25" cy="30" rx="16" ry="14" />
              <path className="cat-ear" d="M14 20 Q12 10 20 15" />
              <path d="M36 20 Q38 10 30 15" />
              <circle cx="20" cy="28" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="30" cy="28" r="1.5" fill="currentColor" stroke="none" />
              <path d="M22 34 Q25 37 28 34" />
            </svg>

            {/* Menu header card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-pink-100 px-5 py-3 flex flex-col items-center justify-center mb-12 md:mb-14"
            >
              <h2 className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">精选菜单 🍵</h2>
              <div className="w-10 h-0.5 bg-pink-400 rounded-full mt-1.5"></div>
              <p className="text-[11px] text-stone-400 mt-1">选你所爱，定制专属 ✨</p>
            </motion.div>
            {/* Firebase loading indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mt-3 flex items-center justify-center gap-2 text-sm text-pink-400 font-medium"
                >
                  <span className="w-4 h-4 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
                  Đang kết nối não bộ Firebase...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Closed store banner */}
            <AnimatePresence>
              {!loading && !storeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-white
                             bg-[#d84c6c] rounded-2xl py-3 px-6 shadow-md shadow-pink-300 animate-pulse"
                >
                  🔴 店主在上课无法接单，请稍后再来 🐱
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2-col mobile / 4-col desktop grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-16 pt-16 px-1">
            {teas.map((tea, index) => (
              <MenuCard
                key={tea.id}
                tea={tea}
                index={index}
                onOpenOptions={handleOpenOptions}
              />
            ))}
          </div>
        </section>

        
        {/* Contact Info Section */}
        <section className="py-20 md:py-24 flex justify-center">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 max-w-2xl w-full flex flex-col md:flex-row items-center justify-center gap-6"
            >
                <div className="flex gap-5 items-center justify-center w-full">
                   <div className="bg-pink-50 p-4 rounded-full text-pink-500 shadow-inner">
                      <Phone className="w-8 h-8" />
                   </div>
                   <div className="text-left">
                     <h3 className="text-xl font-bold text-stone-900 mb-1">联系方式 (Contact)</h3>
                     <p className="text-stone-600 font-medium text-lg mb-1">
                        微信 (WeChat): <span className="text-pink-600 font-bold ml-1 selectable">CallmeMeii</span>
                     </p>
                     <p className="text-stone-500 text-sm">
                        地址: 山东大学留学生公寓2号楼
                     </p>
                   </div>
                </div>
            </motion.div>
        </section>
      </main>

      {/* Floating Cart Button */}
      <motion.button 
        onClick={() => setIsCartOpen(true)}
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 bg-pink-600 text-white w-16 h-16 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center z-40 hover:bg-pink-700 transition-all duration-300 border-[3px] border-white/80"
        style={{ boxShadow: '0 20px 25px -5px rgba(225, 29, 72, 0.4), 0 8px 10px -6px rgba(225, 29, 72, 0.2)' }}
      >
        <ShoppingBag className="w-7 h-7 md:w-8 md:h-8" />
        {cartItemCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={`badge-${cartItemCount}`}
            className="absolute -top-2 -right-2 bg-stone-900 text-white text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-md"
          >
            {cartItemCount}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-stone-100"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="text-pink-600" /> 购物车
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-stone-100 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                    <ShoppingBag className="w-16 h-16 opacity-20" />
                    <p className="text-lg">购物车是空的</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="flex items-center justify-between p-4 bg-[#faf7f7] rounded-2xl border border-stone-100">
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800 text-lg">{item.name}</h4>
                        <p className="text-stone-500 text-sm mb-2">
                          {item.temperature}{item.sugar ? ` · ${item.sugar}` : ''} · {item.size === 'M' ? '中杯' : '大杯'}
                        </p>
                        <p className="font-black text-pink-600">¥{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-stone-100">
                        <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 rounded-lg text-stone-400 hover:text-pink-600 hover:bg-pink-50 transition">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-stone-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 rounded-lg text-stone-400 hover:text-pink-600 hover:bg-pink-50 transition">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-stone-100 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-500 font-medium">合计金额</span>
                    <span className="text-3xl font-black text-stone-900">¥{cartTotal}</span>
                  </div>
                  <button 
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    立即结账 <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Option Picker Modal */}
      <AnimatePresence>
        {optionTea && (
          <OptionModal
            tea={optionTea}
            onClose={() => setOptionTea(null)}
            onConfirm={(item) => { handleAddToCart(item); setOptionTea(null); }}
          />
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#faf7f7] rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition z-10">
                  <X className="w-5 h-5" />
                </button>
                
                <div className="p-8">
                  <h2 className="text-3xl font-black text-stone-900 mb-2">结账 (Checkout)</h2>
                  <p className="text-stone-500 mb-8">请填写收货信息并完成支付</p>

                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Form */}
                    <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">姓名 (Name)</label>
                        <input required type="text" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('请填写此字段。')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm" placeholder="请输入您的姓名" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">
                          电话 (Phone) <span className="text-pink-500 font-semibold text-xs">(必须和正确)</span>
                        </label>
                        <input required type="tel" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('请填写此字段。')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm" placeholder="请输入电话号码" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">
                          地址 (Address) <span className="text-pink-500 font-semibold text-xs">(必须和正确)</span>
                        </label>
                        <textarea required value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} onInvalid={e => (e.target as HTMLTextAreaElement).setCustomValidity('请填写此字段。')} onInput={e => (e.target as HTMLTextAreaElement).setCustomValidity('')} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm resize-none h-24" placeholder="请填写宿舍楼层及房号"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">备注 (Notes)</label>
                        <input type="text" value={checkoutForm.notes} onChange={e => setCheckoutForm({...checkoutForm, notes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm" placeholder="正常冰/少糖 等要求..." />
                      </div>
                    </form>

                    {/* QR Code Section */}
                     <div className="flex-1 flex flex-col items-center h-fit">
                       {/* PC: Dashed pink border section với icon mèo/thỏ */}
                       <div className="hidden md:block w-full rounded-[30px] border-2 border-dashed border-pink-300 bg-pink-50/60 p-6 relative">
                         {/* Floating animal icons */}
                         <span className="absolute -top-3 -left-3 text-xl select-none">🐱</span>
                         <span className="absolute -top-3 -right-3 text-xl select-none">🐰</span>
                         <span className="absolute -bottom-3 -left-3 text-xl select-none">🐰</span>
                         <span className="absolute -bottom-3 -right-3 text-xl select-none">🐱</span>

                         <p className="text-center font-bold text-pink-700 mb-1 text-base">请扫码支付订单金额</p>
                         <p className="text-center text-pink-500 font-extrabold text-3xl mb-5">¥{cartTotal}</p>

                         <div className="flex w-full justify-between gap-4 mb-4">
                           <div className="flex-1 flex flex-col items-center">
                             <div className="relative">
                               <Cat className="absolute -top-2 -left-2 w-5 h-5 text-pink-400" />
                               <div className="w-full aspect-square bg-white rounded-2xl border border-pink-200 shadow-sm flex items-center justify-center overflow-hidden p-1" style={{width:'120px',height:'120px'}}>
                                 <img src="/assets/wechat-qr.png" alt="WeChat Pay" className="w-full h-full object-contain" />
                               </div>
                             </div>
                             <p className="text-sm font-bold text-[#07c160] mt-2">微信支付</p>
                           </div>
                           <div className="flex-1 flex flex-col items-center">
                             <div className="relative">
                               <Rabbit className="absolute -top-2 -right-2 w-5 h-5 text-pink-400" />
                               <div className="w-full aspect-square bg-white rounded-2xl border border-pink-200 shadow-sm flex items-center justify-center overflow-hidden p-1" style={{width:'120px',height:'120px'}}>
                                 <img src="/assets/alipay-qr.png" alt="Alipay" className="w-full h-full object-contain" />
                               </div>
                             </div>
                             <p className="text-sm font-bold text-[#1677ff] mt-2">支付宝</p>
                           </div>
                         </div>

                          <p className="text-center text-lg tracking-widest select-none">🌸 🌷 🌺 🌸 🌷</p>
                       </div>

                       {/* Mobile: nút pill-shape big buttons */}
                       <div className="flex md:hidden flex-col w-full gap-4">
                         <p className="text-center font-bold text-pink-700 mb-1 text-base">请选择支付方式</p>
                         <p className="text-center text-pink-500 font-extrabold text-3xl mb-2">¥{cartTotal}</p>

                          {/* Alipay pill button */}
                          <button
                            type="button"
                            onClick={() => {
                              // Thử deep link trực tiếp — đáng tin hơn thẻ <a> trên mobile browser
                              window.location.href = 'alipayqr://platformapi/startapp?saId=10000007&qrcode=https%3A%2F%2Fqr.alipay.com%2Ffkx17446vp98mn1jilmskd1';
                            }}
                            className="w-full flex items-center justify-center gap-3 text-white font-extrabold py-5 rounded-full text-lg transition-all duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #1677ff 0%, #0052cc 100%)',
                              boxShadow: '0 8px 24px rgba(22,119,255,0.35)',
                            }}
                            onTouchStart={e => (e.currentTarget.style.transform='scale(0.97)')}
                            onTouchEnd={e => (e.currentTarget.style.transform='scale(1)')}
                          >
                            <Cat className="w-6 h-6" />
                            打开支付宝付款
                          </button>

                         {/* WeChat button → mở modal */}
                         <button
                           type="button"
                           onClick={() => setIsWeChatModalOpen(true)}
                           className="w-full flex items-center justify-center gap-3 text-white font-extrabold py-5 rounded-full text-lg transition-all duration-200"
                           style={{
                             background: 'linear-gradient(135deg, #07c160 0%, #059847 100%)',
                             boxShadow: '0 8px 24px rgba(7,193,96,0.35)',
                           }}
                           onTouchStart={e => (e.currentTarget.style.transform='scale(0.97)')}
                           onTouchEnd={e => (e.currentTarget.style.transform='scale(1)')}
                         >
                           <Rabbit className="w-6 h-6" />
                           打开微信付款
                         </button>

                         <p className="text-center text-xs text-pink-500 font-medium pt-1">支付完成后记得截图哦谢谢 🌸</p>
                       </div>
                     </div>
                  </div>

                  {/* Validation error */}
                  {formError && (
                    <p className="mt-4 text-center text-pink-600 font-bold bg-pink-50 border border-pink-200 rounded-xl py-2.5 px-4">
                      {formError}
                    </p>
                  )}

                  <div className="mt-6 pt-6 border-t border-stone-200 flex justify-end">
                     <button
                       type="submit"
                       form="checkout-form"
                       disabled={isSending}
                       className="w-full md:w-auto px-10 py-4 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 active:scale-95 transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                       {isSending ? (
                         <><span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> 提交中...</>
                       ) : (
                         <>我已完成支付 🌸</>
                       )}
                     </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WeChat QR Modal */}
      <AnimatePresence>
        {isWeChatModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWeChatModalOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 250 }}
              className="fixed inset-0 z-[81] flex items-center justify-center p-5 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-sm rounded-[30px] border-2 border-dashed border-pink-300 shadow-2xl overflow-hidden relative"
                style={{ background: 'linear-gradient(160deg, #fff5f7 0%, #ffe4ec 100%)' }}
              >
                {/* Floating animals */}
                <span className="absolute top-3 left-4 text-2xl select-none">🐱</span>
                <span className="absolute top-3 right-4 text-2xl select-none">🐰</span>

                {/* Close button */}
                <button
                  onClick={() => setIsWeChatModalOpen(false)}
                  className="absolute top-4 right-14 p-1.5 bg-white/70 rounded-full text-stone-400 hover:text-stone-700 transition z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center px-6 pt-10 pb-6">
                  <h3 className="text-xl font-black text-pink-700 mb-1">微信扫码付款 🌸</h3>
                  <p className="text-sm text-pink-500 font-medium mb-4">Thanh toán qua WeChat</p>

                  {/* QR image */}
                  <div className="bg-white rounded-2xl border-2 border-pink-200 shadow-md p-3 mb-4 w-52 h-52 flex items-center justify-center">
                    <img src="/assets/wechat-qr.png" alt="WeChat QR" className="w-full h-full object-contain" />
                  </div>

                  {/* Download button */}
                  <a
                    href="/assets/wechat-qr.png"
                    download="wechat-pay-qr.png"
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-pink-300 text-pink-600 font-bold py-3 rounded-full mb-4 hover:bg-pink-50 transition-colors shadow-sm"
                  >
                    <Cat className="w-4 h-4" />
                    🐱 保存二维码 / Tải mã QR
                  </a>

                  {/* Steps */}
                  <div className="w-full bg-white/70 rounded-2xl border border-pink-200 p-4 text-left space-y-2">
                    <p className="text-sm font-bold text-pink-700 mb-2 text-center">📋 使用步骤</p>
                    <div className="flex items-start gap-2">
                      <span className="bg-pink-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <p className="text-sm text-stone-600">点击上方按钮保存二维码到相册<br/><span className="text-stone-400 text-xs">Lưu mã QR vào thư viện ảnh</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-pink-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <p className="text-sm text-stone-600">打开微信 → 扫一扫 → 选择相册中的二维码<br/><span className="text-stone-400 text-xs">Vào WeChat → Quét → chọn ảnh QR từ thư viện</span></p>
                    </div>
                  </div>

                  <p className="text-xs text-pink-400 font-medium mt-4">支付完成后记得截图哦谢谢 🌸</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Complete Modal */}
      <AnimatePresence>
        {isOrderComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🌸
              </div>
              <h2 className="text-2xl font-black text-stone-900 mb-2">已提交审核！</h2>
              <p className="text-pink-500 font-semibold mb-2">请耐心等待店主确认 🌸</p>
              <p className="text-stone-400 text-sm mb-8 leading-relaxed">（订单已提交，请耐心等待确认）</p>
              <button 
                onClick={() => setIsOrderComplete(false)}
                className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition"
              >
                关闭 (Close)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-stone-900 py-12 text-center text-stone-400 border-t border-stone-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <span className="font-bold text-xl text-white mb-4 tracking-wider">Meww Tea <span className="text-pink-500">逆逆奶茶店</span></span>
          <p className="flex justify-center items-center gap-2 font-medium text-sm">
            品质造就品牌 <Crown className="w-4 h-4 text-pink-500" /> 用心服务每一杯
          </p>
          <div className="mt-8 text-xs text-stone-600">
            &copy; 2024 Meww Tea. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
