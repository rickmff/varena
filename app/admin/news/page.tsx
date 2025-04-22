"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface NewsItem {
  id: string
  title: string
  content: string
  date: string
  category: string
  image: string
}

export default function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'UPDATE',
    date: new Date().toISOString().split('T')[0],
    image: null as File | null
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'news'))
      const newsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[]
      setNews(newsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching news:', error)
      toast.error('Failed to fetch news')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = ''
      if (formData.image) {
        const storageRef = ref(storage, `news/${formData.image.name}`)
        await uploadBytes(storageRef, formData.image)
        imageUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'news'), {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        date: formData.date,
        image: imageUrl
      })

      setFormData({
        title: '',
        content: '',
        category: 'UPDATE',
        date: new Date().toISOString().split('T')[0],
        image: null
      })

      toast.success('News item created successfully')
      fetchNews()
    } catch (error) {
      console.error('Error creating news:', error)
      toast.error('Failed to create news item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id))
      toast.success('News item deleted successfully')
      fetchNews()
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error('Failed to delete news item')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add News</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 rounded border bg-background"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-2 rounded border bg-background h-32"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 rounded border bg-background"
              >
                <option value="UPDATE">UPDATE</option>
                <option value="EVENT">EVENT</option>
                <option value="COMMUNITY">COMMUNITY</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Image</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="w-full p-2"
                accept="image/*"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create News'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover mb-4 rounded" />
                )}
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                <p className="mb-4">{item.content}</p>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                  size="sm"
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
