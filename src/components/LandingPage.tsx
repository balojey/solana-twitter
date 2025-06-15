import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Twitter, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  Sparkles,
  Globe,
  Lock,
  TrendingUp,
  MessageCircle,
  Heart,
  Star
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { WalletButton } from './WalletButton';
import { ModeToggle } from './ui/mode-toggle';

export function LandingPage() {
  const { connected } = useWallet();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: "Censorship Resistant",
      description: "Your voice can't be silenced. Built on blockchain technology for true freedom of expression.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Powered by Solana's high-speed blockchain. Post, like, and interact in real-time.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Lock,
      title: "Own Your Data",
      description: "Your profile, tweets, and connections belong to you. No corporate overlords.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with users worldwide in a truly decentralized social network.",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "10K+", color: "text-blue-500" },
    { icon: MessageCircle, label: "Tweets Posted", value: "50K+", color: "text-green-500" },
    { icon: Heart, label: "Interactions", value: "200K+", color: "text-red-500" },
    { icon: TrendingUp, label: "Daily Growth", value: "15%", color: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Twitter className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Solana Social
                </h1>
                <p className="text-sm text-muted-foreground">Decentralized. Uncensored. Yours.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              {!connected && <WalletButton />}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Built on Solana Blockchain
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Your Voice,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Uncensored
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join the revolution of decentralized social media. Share your thoughts, connect with others, 
              and own your digital identity on the blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              {!connected ? (
                <>
                  <WalletButton />
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-2xl px-8 py-6 text-lg font-semibold border-2 hover:bg-accent/80 transition-all duration-300 hover:scale-105"
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-2xl px-12 py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = '/'}
                >
                  Enter App
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${stat.color === 'text-blue-500' ? 'from-blue-500/20 to-blue-500/10' : stat.color === 'text-green-500' ? 'from-green-500/20 to-green-500/10' : stat.color === 'text-red-500' ? 'from-red-500/20 to-red-500/10' : 'from-purple-500/20 to-purple-500/10'} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Why Choose Solana Social?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of social media with blockchain-powered features that put you in control.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="group border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${hoveredFeature === index ? 'scale-110' : ''}`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl">
              <Star className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Ready to Join the Revolution?
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect your Solana wallet and start sharing your thoughts with a global, 
              decentralized community that values freedom and authenticity.
            </p>
            
            {!connected ? (
              <div className="pt-8">
                <WalletButton />
                <p className="text-sm text-muted-foreground mt-4">
                  No wallet? Get started with{' '}
                  <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    Phantom
                  </a>{' '}
                  or{' '}
                  <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                    Solflare
                  </a>
                </p>
              </div>
            ) : (
              <Button 
                size="lg" 
                className="rounded-2xl px-12 py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = '/'}
              >
                Enter Solana Social
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Twitter className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-lg">Solana Social</div>
                <div className="text-sm text-muted-foreground">Powered by Solana Blockchain</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors duration-200">Support</a>
              <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors duration-200">
                Built on Solana
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}