<template>
  <div class="features-page">
    <header>
      <h1>Features</h1>
      <div class="actions">
        <router-link to="/home/dashboard">Home</router-link>
        <router-link to="/login">Login</router-link>
      </div>
    </header>

    <main>Feature content area</main>
    <footer>footer</footer>
  </div>
</template>

<style scoped>
.features-page {
  min-height: 100vh;
  padding: 20px;
  background: #2f95e8;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
}

header,
footer {
  background: #f2a14e;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
}

main {
  background: #d8d8d8;
  border-radius: 8px;
  display: grid;
  place-content: center;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 12px;
}

a {
  color: #14213d;
  background: #f2f2f2;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
}
</style>
