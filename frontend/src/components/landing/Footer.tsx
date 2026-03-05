import Link from "next/link";
import { Youtube, Instagram, Facebook, Send } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 relative overflow-hidden z-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">

                {/* Brand Column */}
                <div>
                    <h3 className="text-2xl font-black text-white mb-6 tracking-tighter">
                        PC<span className="text-[#4f9e97]">LAGBE</span>?
                    </h3>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                        The intelligent PC builder for Bangladesh. Stop overpaying, start building.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#4f9e97] hover:border-[#4f9e97]/50 transition-colors">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#4f9e97] hover:border-[#4f9e97]/50 transition-colors">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#4f9e97] hover:border-[#4f9e97]/50 transition-colors">
                            <Youtube size={18} />
                        </a>
                    </div>
                </div>

                {/* Product Column */}
                <div>
                    <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Product</h4>
                    <ul className="space-y-4">
                        <li><Link href="/build" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">AI Builder</Link></li>
                        <li><Link href="/builds" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">Top Builds</Link></li>
                        <li><Link href="/deals" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">Featured Offers</Link></li>
                        <li><Link href="/roadmap" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">Feature Roadmap</Link></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Support</h4>
                    <ul className="space-y-4">
                        <li><Link href="/faq" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">FAQ & Compatibility</Link></li>
                        <li><Link href="/vendors" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">Verified Vendors</Link></li>
                        <li><Link href="/contact" className="text-neutral-400 hover:text-[#4f9e97] transition-colors">Contact Us</Link></li>
                        <li><Link href="/report" className="text-neutral-400 hover:text-[#4f9e97] hover:text-red-400 transition-colors">Report Unfair Price</Link></li>
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div>
                    <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Weekly Deals</h4>
                    <p className="text-neutral-400 mb-4 text-sm">
                        Get the biggest BD tech price drops delivered to your inbox every Friday.
                    </p>
                    <div className="flex mt-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-neutral-900 border border-neutral-700 rounded-l-lg px-4 py-2 w-full text-white focus:outline-none focus:border-[#4f9e97] transition-colors"
                        />
                        <button className="bg-[#4f9e97] hover:bg-[#6ee1c9] text-black px-4 rounded-r-lg transition-colors flex items-center justify-center">
                            <Send size={18} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <p className="text-neutral-500 text-sm">
                    © {new Date().getFullYear()} Zenfa AI. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm">
                    <Link href="/privacy" className="text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
