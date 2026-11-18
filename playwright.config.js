import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:120000,expect:{timeout:20000},use:{baseURL:'http://127.0.0.1:5173',headless:true,launchOptions:{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'},screenshot:'only-on-failure'},reporter:'list',workers:1});
