'use client'

import { useState } from 'react'
import { createProduct, updateProduct, deleteProduct, toggleProductActive } from '@/app/actions/products'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash2, HelpCircle, Carrot } from 'lucide-react'

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
  const [open, setOpen] = useState(false)
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
    setOpen(true)
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
    setOpen(true)
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
        setOpen(false)
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading">Termékeim</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Itt kezelheted a kínálatodat.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger onClick={handleOpenAdd} className={buttonVariants() + " font-semibold gap-1.5 shadow-sm text-sm cursor-pointer"}>
            <Plus className="h-4 w-4" /> Új termék feltöltése
          </DialogTrigger>
          <DialogContent className="max-w-lg border-border">
            <DialogHeader>
              <DialogTitle className="font-bold">
                {editingProduct ? 'Termék szerkesztése' : 'Új termék hozzáadása'}
              </DialogTitle>
              <DialogDescription>
                Töltsd ki az alábbi adatokat a termék közzétételéhez.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              {error && (
                <div className="p-3 text-xs font-semibold bg-destructive/10 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              {/* Limit alert in dialog */}
              {!editingProduct && limitReached && isActive && (
                <div className="p-3 text-xs bg-amber-50 border border-amber-300 text-amber-800 rounded-lg">
                  Elérted a 20 aktív termékes korlátot a díjmentes fiókoddal. Az új terméket csak inaktívként tudod elmenteni.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="prod-name">Terméknév</Label>
                  <Input
                    id="prod-name"
                    value={name}
                                    placeholder="pl. Friss kerti eper"
                    required
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-cat">Kategória</Label>
                  <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')} required>
                    <SelectTrigger id="prod-cat">
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-unit">Mértékegység</Label>
                  <Select value={unit} onValueChange={(val) => setUnit(val || 'kg')} required>
                    <SelectTrigger id="prod-unit">
                      <SelectValue placeholder="Mértékegység..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg (kilogramm)</SelectItem>
                      <SelectItem value="db">db (darab)</SelectItem>
                      <SelectItem value="liter">liter</SelectItem>
                      <SelectItem value="üveg">üveg</SelectItem>
                      <SelectItem value="csomag">csomag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-price">Egységár (Ft)</Label>
                  <Input
                    id="prod-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="pl. 1200"
                    min="0"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="prod-tags">Címke / Jellemző</Label>
                  <Input
                    id="prod-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="pl. Bio, Szedd magad"
                  />
                </div>

                {/* Image URL */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="prod-image">Termékkép URL (opcionális)</Label>
                  <Input
                    id="prod-image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                {/* Description */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="prod-desc">Leírás (opcionális)</Label>
                  <Textarea
                    id="prod-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rövid tájékoztató a termékről..."
                    rows={3}
                  />
                </div>

                {/* Active switch */}
                <div className="col-span-2 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="prod-active">Azonnal kapható (Aktív)</Label>
                    <span className="text-[10px] text-muted-foreground">
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

              <DialogFooter className="border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
                <Button type="submit" disabled={loading} className="font-semibold">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Mentés
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Free Tier Limit Notification */}
      {subscriptionTier === 'free' && (
        <Card className="bg-primary/5 border-primary/20 p-4 rounded-xl flex items-center justify-between gap-4 text-sm">
          <div>
            Jelenleg a <strong className="text-primary font-bold">Díjmentes csomagban</strong> vagy. 
            Aktív termékek száma: <strong className="text-foreground">{activeCount} / 20</strong>.
          </div>
          {limitReached && (
            <Badge variant="destructive">Limit elért</Badge>
          )}
        </Card>
      )}

      {/* Products Table */}
      {products.length > 0 ? (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Ár</TableHead>
                <TableHead>Mértékegység</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((prod) => (
                <TableRow key={prod.id} className={!prod.is_active ? 'opacity-60 bg-muted/20' : ''}>
                  <TableCell className="font-semibold text-foreground">{prod.name}</TableCell>
                  <TableCell className="font-bold">{Math.round(prod.price)} Ft</TableCell>
                  <TableCell>{prod.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={prod.is_active}
                        onCheckedChange={() => handleToggleActive(prod.id, prod.is_active)}
                      />
                      <Badge variant={prod.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {prod.is_active ? 'Kapható' : 'Nem kapható'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(prod)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prod.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <Carrot className="h-16 w-16 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Még nincsenek termékeid feltöltve</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Kattints a fenti "Új termék feltöltése" gombra a kínálatod összeállításához.
          </p>
          <Button onClick={handleOpenAdd} className="font-semibold">Az első termékem feltöltése</Button>
        </Card>
      )}
    </div>
  )
}
