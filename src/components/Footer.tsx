import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-sand-50 text-sand-900 border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Assistance</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Shipping</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Returns</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Size + Fit</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Garment Care</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">About</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">My Account</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Social</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Instagram</a></li>
              <li><a href="#" className="text-sand-700 hover:text-sand-900 transition-colors">TikTok</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sand-700 hover:text-sand-900 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sand-200 pt-8 text-center text-sm text-sand-600">
          <p>© 2025 COASTAL SWIM</p>
        </div>
      </div>
    </footer>
  );
}