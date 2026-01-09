import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-sand-50 text-black border-t border-sand-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Newsletter + Links Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

          {/* Newsletter */}
          <div className="max-w-md">
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Newsletter
            </h4>

            <form className="flex items-center border-b border-black pb-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder-black/60"
              />
              <button
                type="submit"
                className="ml-4 text-xs uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                Assistance
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:opacity-60">Shipping</Link></li>
                <li><Link href="#" className="hover:opacity-60">Returns</Link></li>
                <li><Link href="#" className="hover:opacity-60">Size + Fit</Link></li>
                <li><Link href="#" className="hover:opacity-60">Garment Care</Link></li>
                <li><Link href="#" className="hover:opacity-60">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:opacity-60">About</Link></li>
                <li><Link href="#" className="hover:opacity-60">My Account</Link></li>
                <li><Link href="#" className="hover:opacity-60">Gift Cards</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                Social
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:opacity-60">Instagram</a></li>
                <li><a href="#" className="hover:opacity-60">TikTok</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:opacity-60">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:opacity-60">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sand-200 pt-8 text-center text-sm opacity-70">
          © 2025 TUALMI OUTDOORS
        </div>
      </div>
    </footer>
  );
}
