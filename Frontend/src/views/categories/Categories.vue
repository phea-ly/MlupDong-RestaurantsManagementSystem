<script setup>
import { onMounted }          from 'vue'
import { useRouter }          from 'vue-router'
import { storeToRefs }        from 'pinia'
import { useCategoryStore }   from '@/stores/category.store'

import CategoryStatsRow     from '@/components/categories/CategoryStatsRow.vue'
import CategoryTopCard      from '@/components/categories/CategoryTopCard.vue'
import CategoryList         from '@/components/categories/CategoryList.vue'
import CategoryDialog       from '@/components/categories/CategoryDialog.vue'
import CategoryDeleteDialog from '@/components/categories/CategoryDeleteDialog.vue'

const router        = useRouter()
const categoryStore = useCategoryStore()

const {
  categories, loading, saving, deleting, snackbar,
  showDialog, showDeleteDialog, editingCategory,
  form, nameError,
  stats, categoryCounts, topCategories,
} = storeToRefs(categoryStore)

const {
  init, openAdd, openEdit, save,
  confirmDelete, handleDelete,
} = categoryStore

onMounted(init)

// Clear name error when user starts typing (emitted from CategoryDialog)
function clearNameError() {
  nameError.value = ''
}

function viewItems(categoryId) {
  router.push({ path: '/home/menu', query: { category: categoryId ?? 'all' } })
}
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Toolbar ──────────────────────────────────────────────────────────── -->
    <div class="d-flex align-center justify-end mb-6">
      <v-btn
        color="var(--app-primary)" rounded="lg" height="40" elevation="0"
        prepend-icon="mdi-plus"
        @click="openAdd"
      >
        <span style="color:#063824; font-weight:800">Add Category</span>
      </v-btn>
    </div>

    <!-- ── Stats ────────────────────────────────────────────────────────────── -->
    <CategoryStatsRow :stats="stats" />

    <!-- ── Main grid ────────────────────────────────────────────────────────── -->
    <v-row dense>
      <v-col cols="12" md="4">
        <CategoryTopCard :top-categories="topCategories" />
      </v-col>
      <v-col cols="12" md="8">
        <CategoryList
          :categories="categories"
          :category-counts="categoryCounts"
          :loading="loading"
          @view="viewItems"
          @edit="openEdit"
          @delete="confirmDelete"
          @view-all="viewItems('all')"
        />
      </v-col>
    </v-row>

    <!-- ── Add / Edit dialog ────────────────────────────────────────────────── -->
    <CategoryDialog
      v-model="showDialog"
      :editing="editingCategory"
      :form="form"
      :saving="saving"
      :name-error="nameError"
      @save="save"
      @clear-name-error="clearNameError"
    />

    <!-- ── Delete confirm dialog ────────────────────────────────────────────── -->
    <CategoryDeleteDialog
      v-model="showDeleteDialog"
      :loading="deleting"
      @confirm="handleDelete"
    />

    <!-- ── Snackbar ──────────────────────────────────────────────────────────── -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
      rounded="lg"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-container>
</template>