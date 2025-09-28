import { statsigAdapter, type StatsigUser } from "@flags-sdk/statsig";
import { flag, dedupe } from "flags/next";
import type { Identify } from "flags";


// 实现identify函数，添加用户属性
export const identify = dedupe((async () => ({
  // 添加任何额外的用户属性，参考 docs.statsig.com/concepts/user
  userID: "1234", //示例用户ID
  country: "CN",
  _appVersion: (import.meta as any).env?.VITE_APP_VERSION || "1.0.0",
  get appVersion() {
    return this._appVersion;
  },
  set appVersion(value) {
    this._appVersion = value;
  },
})) satisfies Identify<StatsigUser>);


// 创建功能标志函数
export const createFeatureFlag = (key: string) => flag<boolean, StatsigUser>({
  key,
  adapter: statsigAdapter.featureGate((gate) => gate.value, {exposureLogging: true}),
  identify,
});