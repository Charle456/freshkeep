import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { getCurrentRouterKind } from '@/app/router'
import About from '@/pages/About'
import AppearanceSettings from '@/pages/AppearanceSettings'
import CategoryManagement from '@/pages/CategoryManagement'
import DataManagement from '@/pages/DataManagement'
import Home from '@/pages/Home'
import Insights from '@/pages/Insights'
import Inventory from '@/pages/Inventory'
import ItemDetail from '@/pages/ItemDetail'
import ItemForm from '@/pages/ItemForm'
import Profile from '@/pages/Profile'
import ReminderSettings from '@/pages/ReminderSettings'
import { AppSettingsProvider } from '@/hooks/useAppSettings'
import { InventoryProvider } from '@/stores/useInventoryStore'

export default function App() {
  const Router = getCurrentRouterKind() === 'hash' ? HashRouter : BrowserRouter

  return (
    <AppSettingsProvider>
      <InventoryProvider>
        <Router>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/items/new" element={<ItemForm />} />
              <Route path="/items/:itemId" element={<ItemDetail />} />
              <Route path="/items/:itemId/edit" element={<ItemForm />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/reminders" element={<ReminderSettings />} />
              <Route path="/settings/data" element={<DataManagement />} />
              <Route path="/settings/categories" element={<CategoryManagement />} />
              <Route path="/settings/appearance" element={<AppearanceSettings />} />
              <Route path="/about" element={<About />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </InventoryProvider>
    </AppSettingsProvider>
  )
}
