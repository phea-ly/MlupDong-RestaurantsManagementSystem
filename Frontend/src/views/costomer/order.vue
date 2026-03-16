<template>
  <div class="cart-layout pb-24">
    <!-- Header -->
    <div class="d-flex flex-column align-center bg-white pt-5 pb-4 position-sticky top-0 sticky-header z-10 elevation-0">
      <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="router.back()" class="position-absolute" style="left: 12px; top: 18px;" color="grey-darken-3"></v-btn>
      <div class="text-h6 font-weight-black line-height-1 text-grey-darken-4 mb-1">Your Cart</div>
      <div class="text-caption font-weight-bold text-green-darken-3 text-uppercase letter-spacing-1" style="font-size: 10px;">Mlup Dong • Table 05</div>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="empty-state text-center px-6 py-10 mt-10">
      <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-cart-off</v-icon>
      <h3 class="text-h6 font-weight-bold text-grey-darken-2 mb-1">Your cart is empty</h3>
      <p class="text-body-2 text-grey-darken-1 mb-6">Add some delicious items from the menu.</p>
      <v-btn color="#215732" rounded="xl" elevation="2" @click="router.push('/customer-menu')" class="px-8 font-weight-bold">Browse Menu</v-btn>
    </div>

    <div v-else class="px-4 pt-6 pb-6">
      <!-- Cart Items -->
      <v-card 
        v-for="item in cartStore.items" 
        :key="item.id" 
        class="cart-item-card rounded-xl pa-3 mb-4 d-flex align-stretch"
      >
        <v-img :src="item.image || fallbackImg" width="100" height="100" class="rounded-xl mr-4 flex-shrink-0 bg-grey-lighten-4" cover></v-img>
        <div class="flex-grow-1 d-flex flex-column justify-space-between pl-1 py-1">
          <div class="d-flex justify-space-between align-start">
            <div class="font-weight-bold text-grey-darken-4 line-clamp-2 pr-2" style="font-size: 16px; line-height: 1.25;">{{ item.name }}</div>
            <v-icon size="20" color="grey-lighten-1" @click="cartStore.removeFromCart(item.id)">mdi-trash-can</v-icon>
          </div>
          <div class="d-flex justify-space-between align-end mt-2 pb-1">
            <div class="font-weight-black text-green-darken-4 text-subtitle-1">${{ item.price.toFixed(2) }}</div>
            
            <div class="quantity-control d-flex align-center rounded-pill pa-1 pl-2 pr-2">
              <v-icon size="18" :color="item.quantity <= 1 ? 'grey-lighten-1' : 'grey-darken-3'" @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="cursor-pointer">mdi-minus</v-icon>
              <div class="px-4 font-weight-black text-body-2">{{ item.quantity }}</div>
              <v-btn icon size="24" color="#215732" class="rounded-circle elevation-0" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">
                <v-icon size="16" color="white">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Special Instructions -->
      <div class="mt-6 mb-8">
        <div class="d-flex align-center mb-3">
          <v-icon color="#215732" size="20" class="mr-2">mdi-pencil-outline</v-icon>
          <div class="text-subtitle-2 font-weight-bold text-grey-darken-3">Special Instructions for the Chef</div>
        </div>
        <v-textarea
          v-model="cartStore.specialInstructions"
          placeholder="Allergies, specific requests, or how you like your spice level..."
          variant="outlined"
          bg-color="white"
          rounded="xl"
          hide-details
          auto-grow
          rows="3"
          color="#215732"
          class="custom-textarea"
        ></v-textarea>
      </div>
    </div>

    <!-- Summary & Checkout (Fixed Bottom) -->
    <v-slide-y-reverse-transition>
      <div v-if="cartStore.items.length > 0" class="fixed-bottom-checkout bg-white pt-5 pb-6 px-5 elevation-10 rounded-t-xl">
        <div class="d-flex justify-space-between mb-1 mt-1">
          <div class="text-body-2 text-grey-darken-1 font-weight-medium">Subtotal</div>
          <div class="text-body-2 font-weight-bold text-grey-darken-3">${{ cartStore.cartSubtotal.toFixed(2) }}</div>
        </div>
        <div class="d-flex justify-space-between mb-4">
          <div class="text-body-2 text-grey-darken-1 font-weight-medium">Tax (10%)</div>
          <div class="text-body-2 font-weight-bold text-grey-darken-3">${{ cartStore.cartTax.toFixed(2) }}</div>
        </div>
        
        <v-divider class="mb-4 border-dashed"></v-divider>
        
        <div class="d-flex justify-space-between align-center mb-6">
          <div class="text-subtitle-1 font-weight-black text-grey-darken-4">Total Amount</div>
          <div class="text-h5 font-weight-black text-green-accent-4">${{ cartStore.cartTotal.toFixed(2) }}</div>
        </div>
        
        <v-btn 
          color="#00e676" 
          rounded="xl" 
          block 
          size="x-large" 
          class="font-weight-black text-grey-darken-4 elevation-2 place-order-btn"
          @click="placeOrder"
          :loading="isPlacingOrder"
        >
          <span class="mr-2">PLACE ORDER</span>
          <v-icon size="20">mdi-rocket-launch</v-icon>
        </v-btn>
        <div class="text-center mt-3 text-grey-lighten-1" style="font-size: 9px; letter-spacing: 0.5px; text-transform: uppercase;">
          By placing order you agree to our terms of service
        </div>
      </div>
    </v-slide-y-reverse-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores'

const router = useRouter()
const cartStore = useCartStore()

const fallbackImg = 'https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop'
const isPlacingOrder = ref(false)

async function placeOrder() {
  if (cartStore.items.length === 0) return

  isPlacingOrder.value = true
  
  // Simulate API call for order placement
  setTimeout(() => {
    isPlacingOrder.value = false
    cartStore.clearCart()
    alert('Order placed successfully! The chef is preparing your meal.')
    router.replace('/customer-menu')
  }, 1000)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

.cart-layout {
  font-family: 'Manrope', sans-serif;
  max-width: 480px; 
  margin: 0 auto;
  background-color: #f5f8f6;
  background-image: radial-gradient(rgba(33, 87, 50, 0.08) 2px, transparent 2px), radial-gradient(rgba(33, 87, 50, 0.08) 2px, transparent 2px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.sticky-header {
  box-shadow: 0 2px 20px rgba(0,0,0,0.04) !important;
}

.line-height-1 { line-height: 1.2; }
.letter-spacing-1 { letter-spacing: 1px; }

.cart-item-card {
  background-color: white !important;
  border: 1px solid rgba(0,0,0,0.02) !important;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1) !important;
}

.quantity-control {
  background-color: white;
  border: 1px solid #e8edea;
}

.custom-textarea :deep(.v-field__outline) { border: 1px solid #e8edea !important; }
.custom-textarea :deep(.v-field) {
  box-shadow: 0 4px 16px rgba(0,0,0,0.02) !important;
  border-radius: 16px;
  transition: all 0.2s;
}
.custom-textarea :deep(.v-field--focused) {
  box-shadow: 0 4px 16px rgba(33,87,50,0.1) !important;
}

.fixed-bottom-checkout {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  max-width: 480px;
  margin: 0 auto;
  z-index: 100;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.08) !important;
}

.border-dashed {
  border-style: dashed !important;
  opacity: 0.15;
}

.place-order-btn {
  background: linear-gradient(135deg, #0ceb7e 0%, #00c853 100%) !important;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s;
}

.place-order-btn:active {
  transform: scale(0.96);
  box-shadow: 0 4px 10px rgba(0, 200, 83, 0.3) !important;
}

.pb-24 { padding-bottom: 270px; }
.border-thin { border: 1px solid #f0f4f2; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
