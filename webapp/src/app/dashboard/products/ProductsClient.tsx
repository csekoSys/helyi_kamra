'use client'

import { useState } from 'react'
import { createProduct, updateProduct, deleteProduct, toggleProductActive } from '@/app/actions/products'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash2, Carrot } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  unit: string
  category_id: string | null
  is_active: boolean
  image_url: string | null
  tags: string | null
}

interface ProductsClientProps {
  products: Product[]
  categories: Category[]
  subscriptionTier: string
}

export default function ProductsClient({ products, categories, subscriptionTier }: ProductsClientProps) {
  const [loading, setLoading] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('kg')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')

  const activeCount = products.filter((p) => p.is_active).length
  const limitReached = subscriptionTier === 'free' && activeCount >= 20

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setName('')
    setDescription('')
    setPrice('')
    setUnit('kg')
    setCategoryId(categories[0]?.id || '')
    setIsActive(true)
    setImageUrl('')
    setTags('')
    setError(null)
    setIsFormVisible(true)
  }

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod)
    setName(prod.name)
    setDescription(prod.description || '')
    setPrice(prod.price.toString())
    setUnit(prod.unit)
    setCategoryId(prod.category_id || '')
    setIsActive(prod.is_active)
    setImageUrl(prod.image_url || '')
    setTags(prod.tags || '')
    setError(null)
    setIsFormVisible(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !unit || !categoryId) return

    setLoading(true)
    setError(null)

    const payload = {
      name,
      description: description || undefined,
      price: parseFloat(price),
      unit,
      category_id: categoryId,
      is_active: isActive,
      image_url: imageUrl || undefined,
      tags: tags || undefined,
    }

    try {
      let res
      if (editingProduct) {
        res = await updateProduct(null, { ...payload, id: editingProduct.id })
      } else {
        res = await createProduct(null, payload)
      }

      if (res.error) {
        setError(res.error)
      } else {
        setIsFormVisible(false)
      }
    } catch (err: any) {
      setError('Hiba történt a mentés során.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a terméket?')) return

    try {
      await deleteProduct(id)
    } catch (err) {
      alert('Sikertelen törlés.')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleProductActive(id, !currentStatus)
      if (res && res.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Hiba a státusz módosításakor.')
    }
  }

  return (
    <div className="flex flex-col gap-8 relative max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white leading-tight">Termékeim</h1>
          <p className="text-white/50 text-sm mt-1">Itt kezelheted a kínálatodat.</p>
        </div>
        {!isFormVisible && (
          <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg cursor-pointer">
            <Plus className="h-5 w-5 mr-2" /> Új termék feltöltése
          </Button>
        )}
      </div>

      {isFormVisible && (
        <Card className="glass-card shadow-2xl border-white/[0.08] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="border-b border-white/[0.06] pb-6">
            <CardTitle className="text-xl font-bold text-white">
              {editingProduct ? 'Termék szerkesztése' : 'Új termék hozzáadása'}
            </CardTitle>
            <CardDescription className="text-white/50">
              Töltsd ki az alábbi adatokat a termék közzétételéhez.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm font-semibold bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}

              {!editingProduct && limitReached && isActive && (
                <div className="p-4 text-sm bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl">
                  Elérted a 20 aktív termékes korlátot a díjmentes fiókoddal. Az új terméket csak inaktívként tudod elmenteni.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <Label htmlFor="prod-name" className="font-bold text-white/80">Terméknév</Label>
                  <Input
                    id="prod-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="pl. Friss kerti eper"
                    required
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="prod-cat" className="font-bold text-white/80">Kategória</Label>
                  <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')} required>
                    <SelectTrigger id="prod-cat" className="h-14 rounded-xl border-white/[0.08] bg-white/[0.01] text-white focus:border-primary/50">
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent className="border-white/[0.08] bg-card/90 backdrop-blur-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit */}
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="prod-unit" className="font-bold text-white/80">Mértékegység</Label>
                  <Select value={unit} onValueChange={(val) => setUnit(val || 'kg')} required>
                    <SelectTrigger id="prod-unit" className="h-14 rounded-xl border-white/[0.08] bg-white/[0.01] text-white focus:border-primary/50">
                      <SelectValue placeholder="Mértékegység..." />
                    </SelectTrigger>
                    <SelectContent className="border-white/[0.08] bg-card/90 backdrop-blur-xl">
                      <SelectItem value="kg">kg (kilogramm)</SelectItem>
                      <SelectItem value="db">db (darab)</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                      <SelectItem value="üveg">üveg</SelectItem>
                      <SelectItem value="csomag">csomag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="prod-price" className="font-bold text-white/80">Egységár (Ft)</Label>
                  <Input
                    id="prod-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="pl. 1200"
                    min="0"
                    required
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="prod-tags" className="font-bold text-white/80">Címke / Jellemző</Label>
                  <Input
                    id="prod-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="pl. Bio, Szedd magad"
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <Label htmlFor="prod-image" className="font-bold text-white/80">Termékkép URL (opcionális)</Label>
                  <Input
                    id="prod-image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="border-white/[0.08] bg-white/[0.01] text-white focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-xl"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <Label htmlFor="prod-desc" className="font-bold text-white/80">Leírás (opcionális)</Label>
                  <Textarea
                    id="prod-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rövid tájékoztató a termékről..."
                    rows={3}
                    className="border-white/[0.08] bg-white/[0.01] text-white placeholder:text-white/30 rounded-xl focus:border-primary/50 focus-visible:ring-primary/20 resize-none"
                  />
                </div>

                {/* Active switch */}
                <div className="md:col-span-2 flex items-center justify-between border-t border-white/[0.06] pt-5 mt-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="prod-active" className="font-bold text-white">Azonnal kapható (Aktív)</Label>
                    <span className="text-xs text-white/40">
                      Az inaktív termékek nem jelennek meg a nyilvános adatlapon.
                    </span>
                  </div>
                  <Switch
                    id="prod-active"
                    checked={isActive}
                    onCheckedChange={(checked) => {
                      if (!editingProduct && limitReached && checked) {
                        alert('Nem aktiválhatod a terméket, mert elérted a 20 aktív termékes korlátot!')
                        return
                      }
                      setIsActive(checked)
                    }}
                  />
                </div>
              </div>

              <CardFooter className="border-t border-white/[0.06] pt-6 px-0 pb-0 gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsFormVisible(false)} className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/[0.08] text-white hover:text-white cursor-pointer">
                  Mégse
                </Button>
                <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-0 text-white cursor-pointer">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Mentés
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}

      {!isFormVisible && (
        <>
          {subscriptionTier === 'free' && (
            <Card className="glass-card border-white/[0.08] p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
              <div className="text-sm text-white/70">
                Jelenleg a <strong className="text-primary font-bold">Díjmentes csomagban</strong> vagy. 
                Aktív termékek száma: <strong className="text-white">{activeCount} / 20</strong>.
              </div>
              {limitReached && (
                <Badge variant="destructive" className="bg-destructive/20 border-destructive/30 text-destructive-foreground font-bold px-3 py-1 rounded-full">Limit elért</Badge>
              )}
            </Card>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <Card key={prod.id} className={`glass-card hover:border-white/15 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between ${!prod.is_active ? 'opacity-60' : ''}`}>
                  <div className="h-40 bg-white/[0.01] flex items-center justify-center relative border-b border-white/[0.04]">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="object-cover w-full h-full" />
                    ) : (
                      <Carrot className="h-14 w-14 text-primary/10" />
                    )}
                    <Badge className="absolute top-3 left-3 text-[10px] font-bold bg-white/[0.05] border border-white/[0.08] text-primary" variant="secondary">
                      {categories.find(c => c.id === prod.category_id)?.name || 'Kategória'}
                    </Badge>
                  </div>
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-lg font-bold text-white">{prod.name}</CardTitle>
                    <CardDescription className="text-sm text-white/50 line-clamp-2 mt-1">
                      {prod.description || 'Nincs leírás megadva.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="flex justify-between items-center mt-2 pb-4 border-b border-white/[0.04]">
                      <div className="text-primary font-black text-xl">
                        {Math.round(prod.price)} Ft <span className="text-xs font-semibold text-white/40">/ {prod.unit}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] py-1 px-3 rounded-full">
                        <Switch
                          checked={prod.is_active}
                          onCheckedChange={() => handleToggleActive(prod.id, prod.is_active)}
                          className="scale-90"
                        />
                        <span className="text-[10px] font-bold text-white/80">
                          {prod.is_active ? 'Aktív' : 'Inaktív'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button 
                        variant="secondary" 
                        className="flex-1 h-11 rounded-lg border-white/10 text-white font-bold bg-white/[0.02] hover:bg-white/[0.08] cursor-pointer" 
                        onClick={() => handleOpenEdit(prod)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Szerkesztés
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="h-11 w-11 rounded-lg flex-shrink-0 cursor-pointer" 
                        onClick={() => handleDelete(prod.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-16 text-center border-dashed border-white/[0.08] shadow-xl">
              <Carrot className="h-16 w-16 text-primary/20 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Még nincsenek termékeid feltöltve</h3>
              <p className="text-sm text-white/50 max-w-sm mx-auto mb-8 leading-relaxed">
                Kattints a fenti "Új termék feltöltése" gombra a kínálatod összeállításához.
              </p>
              <Button onClick={handleOpenAdd} className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-0 text-white cursor-pointer">Az első termékem feltöltése</Button>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
