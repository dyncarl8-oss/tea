import React, { useState } from 'react';
import { ArrowRight, Sparkles, Coffee, Share2, Copy, Check } from 'lucide-react';
import { Product, Recommendation, Symptom } from '../types';
import { getSmartRecommendation } from '../services/geminiService';
import api from '../services/api';

interface SymptomToolProps {
  userAffiliateId?: string;
}

export const SymptomTool: React.FC<SymptomToolProps> = ({ userAffiliateId }) => {
  const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get('/symptoms'),
          api.get('/products')
        ]);
        setSymptomsList(sRes.data);
        setProductsList(pRes.data);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
  }, []);

  const toggleSymptom = (symptomName: string) => {
    if (selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomName));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && !freeText) return;

    setLoading(true);
    setResult(null);

    try {
      // Call Gemini Service with REAL products list
      const recommendation = await getSmartRecommendation(freeText, selectedSymptoms, productsList);
      setResult(recommendation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateLink = (productId: string) => {
    const baseUrl = "https://shop.herbalroots.com/product/";
    const affiliateParam = userAffiliateId ? `?ref=${userAffiliateId}` : '';
    return `${baseUrl}${productId}${affiliateParam}`;
  };

  const copyLink = () => {
    if (result) {
      navigator.clipboard.writeText(generateAffiliateLink(result.product.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-brand-dark">Symptom-to-Stems</h2>
        <p className="text-stone-600 max-w-lg mx-auto">
          Tell us how you're feeling, and we'll curate the perfect herbal ritual for your needs.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <label className="block text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wide">
          Select Symptoms
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {symptomsList.map((symptom) => (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${selectedSymptoms.includes(symptom.name)
                ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-brand-light'
                }`}
            >
              {symptom.name}
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wide">
          Describe specific feelings (optional)
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="I've been feeling stressed and having trouble sleeping lately..."
          className="w-full p-4 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-stone-700 min-h-[100px] bg-stone-50"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || (selectedSymptoms.length === 0 && !freeText)}
          className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${loading || (selectedSymptoms.length === 0 && !freeText)
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
            : 'bg-brand-dark text-white hover:bg-brand-primary shadow-lg hover:shadow-xl'
            }`}
        >
          {loading ? (
            <>
              <Sparkles className="animate-spin h-5 w-5" /> Curating Ritual...
            </>
          ) : (
            <>
              Find My Blend <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-brand-sand/30 rounded-2xl p-8 border border-stone-200 space-y-8 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img
              src={result.product.image}
              alt={result.product.name}
              className="w-full md:w-1/3 rounded-xl object-cover shadow-md aspect-square"
            />
            <div className="flex-1 space-y-4">
              <div className="inline-block px-3 py-1 bg-brand-accent/20 text-brand-accent text-xs font-bold rounded-full uppercase tracking-wider">
                Top Recommendation
              </div>
              <h3 className="text-3xl font-serif text-brand-dark">{result.product.name}</h3>
              <p className="text-stone-700 leading-relaxed">{result.product.description}</p>

              <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-brand-primary mb-2">
                  <Sparkles className="h-4 w-4" /> Why it works
                </h4>
                <p className="text-sm text-stone-600">{result.whyItWorks}</p>
              </div>

              <div className="bg-brand-dark/5 p-4 rounded-xl border border-brand-dark/10">
                <h4 className="flex items-center gap-2 font-bold text-brand-dark mb-2">
                  <Coffee className="h-4 w-4" /> Your Ritual
                </h4>
                <p className="text-sm text-brand-primary italic">"{result.ritual}"</p>
              </div>

              {/* Affiliate/Purchase Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-brand-dark text-white py-3 px-6 rounded-lg font-bold hover:bg-brand-primary transition-colors shadow-lg">
                  Purchase for ${result.product.price}
                </button>
                {userAffiliateId && (
                  <button
                    onClick={copyLink}
                    className="flex-1 bg-white text-brand-dark border border-stone-200 py-3 px-6 rounded-lg font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {copied ? "Link Copied!" : "Share Affiliate Link"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};