import React, { useState } from "react";
import { ArtistRegistryService } from "@/services";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search
} from "lucide-react";
import { toast } from "sonner";

export default function ArtistRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: artists, isLoading } = useQuery({
    queryKey: ['artist-registry'],
    queryFn: async () => {
      const all = await ArtistRegistryService.list();
      return all;
    },
    initialData: [],
  });

  const sendReportMutation = useMutation({
    mutationFn: async () => {
      const response = await httpsCallable(functions, 'sendArtistRegistryReport')({});
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Report sent! ${data.stats.totalArtists} verified artists`);
    },
    onError: (error) => {
      toast.error('Failed to send report: ' + error.message);
    }
  });

  const stats = {
    total: artists.length,
    verified: artists.filter(a => a.verification_status === 'verified').length,
    pending: artists.filter(a => a.verification_status === 'pending').length,
    rejected: artists.filter(a => a.verification_status === 'rejected').length,
    active: artists.filter(a => a.is_active).length
  };

  const categories = [...new Set(
    artists.flatMap(a => a.artist_categories || [])
  )];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           artist.artist_categories?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">Artist Registry</h1>
            <p className="text-muted-foreground">Complete database of registered artists and their information</p>
          </div>
          <Button 
            onClick={() => sendReportMutation.mutate()}
            disabled={sendReportMutation.isPending}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            {sendReportMutation.isPending ? 'Sending...' : 'Email Report'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Artists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Artists ({filteredArtists.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Categories</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArtists.map((artist) => (
                    <tr key={artist.user_email} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{artist.full_name}</td>
                      <td className="py-3 px-4 text-sm">{artist.user_email}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {artist.artist_categories?.slice(0, 2).map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {artist.artist_categories?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{artist.artist_categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{artist.phone_number || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={artist.verification_status === 'verified' ? 'default' : 
                                   artist.verification_status === 'pending' ? 'secondary' : 'destructive'}
                          className={
                            artist.verification_status === 'verified' ? 'bg-green-600' :
                            artist.verification_status === 'pending' ? 'bg-yellow-600' : ''
                          }
                        >
                          {artist.verification_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(artist.registration_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}