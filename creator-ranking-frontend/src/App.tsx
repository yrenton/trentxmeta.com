import { useState } from 'react'
import { Twitter, TrendingUp, Users, MessageSquare, Eye, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import './App.css'

interface RankingData {
  handle: string
  followers: number
  following: number
  tweets: number
  impressions: number
  score: number
  global_rank: number
  total_users: number
}

function App() {
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rankingData, setRankingData] = useState<RankingData | null>(null)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!handle.trim()) {
      setError('Please enter a Twitter handle')
      return
    }

    setLoading(true)
    setError('')
    setRankingData(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/rank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: handle.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch ranking')
      }

      const data = await response.json()
      setRankingData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getPercentile = (rank: number, total: number): number => {
    return Math.round((1 - rank / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Twitter className="w-12 h-12 text-blue-500 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Creator Rank
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Discover your global ranking among 15 million creators
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Ranking</CardTitle>
            <CardDescription>
              Enter your Twitter handle to see your global creator rank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  @
                </span>
                <Input
                  type="text"
                  placeholder="username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="pl-8 text-lg h-12"
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Loading...' : 'Get Rank'}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {rankingData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Global Rank Card */}
            <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl mb-2">@{rankingData.handle}</CardTitle>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Award className="w-5 h-5" />
                  <span className="text-lg">Your Global Rank</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    #{rankingData.global_rank.toLocaleString()}
                  </div>
                  <div className="text-2xl text-gray-600">
                    out of {rankingData.total_users.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-inner">
                  <div className="text-sm text-gray-600 mb-2">
                    Top {getPercentile(rankingData.global_rank, rankingData.total_users)}% of all creators
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${getPercentile(rankingData.global_rank, rankingData.total_users)}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Followers</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatNumber(rankingData.followers)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Following</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatNumber(rankingData.following)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tweets</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatNumber(rankingData.tweets)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Eye className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Impressions</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatNumber(rankingData.impressions)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score Card */}
            <Card className="shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Creator Score</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {rankingData.score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Based on followers, engagement,</div>
                    <div>content volume, and reach</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Rankings are calculated based on followers, engagement ratio, content volume, and impressions</p>
        </div>
      </div>
    </div>
  )
}

export default App
