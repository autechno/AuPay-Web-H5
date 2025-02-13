<template>
<!--  <Header v-if="!isFilteredRoute"></Header>-->
  <main>
    <slot></slot>
<!--    <AffixContainer />-->
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import Header from '@/composables/Header.vue';
import AffixContainer from '@/composables/AffixContainer.vue';
import { useRoute } from 'vue-router';
// 获取当前路由
const route = useRoute();
const isFilteredRoute = computed(() => {
  const filteredRoutes = [ '/', '/user/login', '/user/forgot-password', '/user/register', '/user/register/stepReg', '/user/register/stepBind', '/user/login/stepEmail'];
  return filteredRoutes.includes(route.path);
});
onMounted(() => {
  document.body.className = isFilteredRoute.value ? 'default-body' : 'filtered-body';
});
</script>

<style lang="less">
.default-body {
  position: relative;
  margin: 0 !important;
  padding: 0 18px;
  background: linear-gradient(to bottom, #EAF7FF, #FFFFFF);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.filtered-body {
  position: relative;
  margin: 0 !important;
  padding: 0 18px;
  background: radial-gradient(circle at top left, #EAF7FF, #FFFFFF);
  background-size: 90% 30%;
  background-repeat: no-repeat;
  min-height: 100vh;
  height: auto;
  overflow: auto;
}
.custom-button{
  background: #5686E1;
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  height: 56px;
  color: #fff;
  border: 0;
  border-radius: 16px;
}
.custom-button-pos{
  width: calc(100vw - 40px);
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translate(-50%);
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
}
.custom-button-down{
  background: #5686E1;
  border: #5686E1 solid 2px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  height: 44px;
  color: #fff;
  border-radius: 16px;
}
.custom-button-down-default{
  background: #ffffff;
  border: #C8DCE8 solid 2px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  height: 44px;
  border-radius: 16px;
  color: #333333;
}
.el-button.is-disabled.custom-button{
  background: #A3A8B0!important;
  color: #fff;
}
.custom-button-sm{
  background: #5686E1;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  line-height: 43px;
  height: 43px;
  color: #fff;
  border: 0;
  border-radius: 16px;
}
.el-button+.el-button{
  margin:0;
}
.custom-dialog{
  position: relative;
  width: 70%!important;
  .el-dialog__header{display: none}
}
.custom-drawer{
  position: relative;
  margin: 0 !important;
  padding: 0!important;
  background: radial-gradient(circle at top left, #EAF7FF, #FFFFFF);
  background-repeat: no-repeat;
  min-height: 100vh;
  height: auto;
  overflow: auto;
  .el-drawer__header{
    display: none;
  }
  .el-drawer__body{
    padding: 18px !important;
  }
}
.customer-input {
  :deep(.el-input) {
    width: 100%;
    height: 40px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.checkbox__label) {
    color: #dcdcdc !important;
  }
  :deep(.el-form-item__error) {
    padding-left: 14px;
  }
  :deep(.el-checkbox__label) {
    font-weight: normal !important;
  }
}
.code-wrap{
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .arrow {
    position: absolute;
    width: 30px;
    height: auto;
  }
  .top-left {
    top: 0px;
    left: 0px;
    transform: rotate(-90deg);
  }
  .top-right {
    top: 0px;
    right: 0px;
  }
  .bottom-left {
    bottom: 0px;
    left: 0px;
    transform: rotate(-180deg);
  }
  .bottom-right {
    bottom: 0px;
    right: 0px;
    transform: rotate(90deg);
  }
}

.icon-container{
  margin-top: 22px;
  width: 106%;
  text-align: center;
  .icon-text{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70px;
    height: 64px;
    background: #EAF3FA;
    overflow: hidden;
    border-radius: 10px;
    font-weight: bold;
    font-size: 12px!important;
    color: #0D0D0D;
    text-decoration: none;
  }
  i{
    display: block;
    width: 28px;
    height: 28px;
    margin: 7px auto 4px auto;
  }
  i.i1{
    background: url(@@/public/images/oi1.svg)  no-repeat;
    background-size: 100%;
  }
  i.i2{
    background: url(@@/public/images/oi2.svg)  no-repeat;
    background-size: 100%;
  }
  i.i3{
    background: url(@@/public/images/oi3.svg)  no-repeat;
    background-size: 100%;
  }
  i.i4{
    background: url(@@/public/images/oi4.svg)  no-repeat;
    background-size: 100%;
  }
}

.menu-container {
  text-align: center;
  background: #ffffff;
  height: 88px;
  border-radius: 30px;
  box-shadow: 0 12px 20px rgba(109, 110, 124, 0.2);
  position: fixed;
  width: calc(100vw - 40px);
  bottom: 16px;
  .icon-text{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    width: 70px;
    height: 64px;
    overflow: hidden;
    font-weight: bold;
    font-size: 12px!important;
    color: #333333;
  }
  i{
    display: block;
    width: 28px;
    height: 28px;
    margin: 7px auto 4px auto;
  }
  .i1 i{
    background: url(@@/public/images/bi1.svg)  no-repeat;
    background-size: 100%;
  }
  .i2 i{
    background: url(@@/public/images/bi2.svg)  no-repeat;
    background-size: 100%;
  }
  .i3 i{
    background: url(@@/public/images/bi3.svg)  no-repeat;
    background-size: 100%;
  }
  .i4 i{
    background: url(@@/public/images/bi4.svg)  no-repeat;
    background-size: 100%;
  }
  .cur1, .cur2, .cur3, .cur4{
    color: #1C63FF;
  }
  .cur1 i{
    background: url(@@/public/images/cbi1.svg)  no-repeat;
    background-size: 100%;
  }
  .cur2 i{
    color: #1C63FF;
    background: url(@@/public/images/cbi2.svg)  no-repeat;
    background-size: 100%;
  }
  .cur3 i{
    color: #1C63FF;
    background: url(@@/public/images/cbi3.svg)  no-repeat;
    background-size: 100%;
  }
  .cur4 i{
    color: #1C63FF;
    background: url(@@/public/images/cbi4.svg)  no-repeat;
    background-size: 100%;
  }
}

</style>
