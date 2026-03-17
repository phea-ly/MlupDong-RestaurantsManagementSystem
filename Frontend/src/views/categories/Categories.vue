<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useMenuStore } from "@/stores";
import { useCategoriesViewStore } from "@/stores";
import CategoryStatsRow from "@/components/categories/CategoryStatsRow.vue";
import CategoryTopCard from "@/components/categories/CategoryTopCard.vue";
import CategoryList from "@/components/categories/CategoryList.vue";
import CategoryDialog from "@/components/categories/CategoryDialog.vue";
import CategoryDeleteDialog from "@/components/categories/CategoryDeleteDialog.vue";

const router = useRouter();
const menuStore = useMenuStore();
const categoriesStore = useCategoriesViewStore();
const {
  showCatDialog,
  editingCategory,
  catForm,
  catSaving,
  showDeleteCatDlg,
  snackbar,
  categoryStats,
  categoryCounts,
  topCategories,
} = storeToRefs(categoriesStore);

const {
  init,
  openAddCategory,
  openEditCategory,
  saveCategory,
  confirmDeleteCategory,
  handleDeleteCategory,
  viewItems,
} = categoriesStore;

onMounted(init);
</script>

<template>
  <v-container fluid class="pa-0">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <!-- <h1 class="text-h5 font-weight-black text-high-emphasis">Categories</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Manage your menu categories and quickly filter menu items
        </p> -->
      </div>
      <v-btn
        color="var(--app-primary)"
        rounded="lg"
        height="40"
        elevation="0"
        prepend-icon="mdi-plus"
        @click="openAddCategory"
      >
        <span style="color: #063824; font-weight: 800">Add Category</span>
      </v-btn>
    </div>

    <CategoryStatsRow :stats="categoryStats" />

    <v-row dense>
      <v-col cols="12" md="4">
        <CategoryTopCard :top-categories="topCategories" />
      </v-col>

      <v-col cols="12" md="8">
        <CategoryList
          :categories="menuStore.categories"
          :category-counts="categoryCounts"
          @view="(id) => viewItems(router, id)"
          @edit="openEditCategory"
          @delete="confirmDeleteCategory"
          @view-all="() => viewItems(router, 'all')"
        />
      </v-col>
    </v-row>

    <CategoryDialog
      v-model="showCatDialog"
      :editing="editingCategory"
      :form="catForm"
      :saving="catSaving"
      @save="saveCategory"
    />

    <CategoryDeleteDialog
      v-model="showDeleteCatDlg"
      @confirm="handleDeleteCategory"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" :timeout="3000" rounded="lg">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

