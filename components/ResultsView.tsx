import React from 'react';
import { Contact } from '../types';
import { Download, UserPlus, FileSpreadsheet, CheckCircle, RefreshCcw } from 'lucide-react';
import { generateCSV, generateVCF, downloadFile } from '../services/fileUtils';

interface ResultsViewProps {
  contacts: Contact[];
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ contacts, onReset }) => {
  
  const handleDownloadCSV = () => {
    const csv = generateCSV(contacts);
    downloadFile(csv, `contacts_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
  };

  const handleDownloadVCF = () => {
    const vcf = generateVCF(contacts);
    downloadFile(vcf, `contacts_${new Date().toISOString().slice(0,10)}.vcf`, 'text/vcard');
  };

  const handleSaveContact = (contact: Contact) => {
    const vcf = generateVCF([contact]);
    downloadFile(vcf, `${contact.fullName.replace(/\s+/g, '_')}.vcf`, 'text/vcard');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="text-green-500 w-8 h-8" />
            Scan Complete
          </h2>
          <p className="text-gray-600 mt-1">Found {contacts.length} business card{contacts.length !== 1 ? 's' : ''}.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button 
            onClick={onReset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw size={18} />
            Scan New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contacts.map((contact, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate" title={contact.fullName}>{contact.fullName || 'Unknown Name'}</h3>
                <button 
                  onClick={() => handleSaveContact(contact)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Save this contact"
                >
                  <UserPlus size={20} />
                </button>
              </div>
              <p className="text-sm text-blue-600 font-medium mb-1 truncate">{contact.title}</p>
              <p className="text-sm text-gray-500 mb-3 truncate font-semibold">{contact.company}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                {contact.email && (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold uppercase w-10 text-gray-400">Email</span>
                    <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">{contact.email}</a>
                  </div>
                )}
                {(contact.mobile || contact.phone) && (
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold uppercase w-10 text-gray-400">Phone</span>
                    <a href={`tel:${contact.mobile || contact.phone}`} className="hover:text-blue-600 truncate">
                      {contact.mobile || contact.phone}
                    </a>
                  </div>
                )}
                {contact.website && (
                   <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold uppercase w-10 text-gray-400">Web</span>
                    <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 truncate">
                      {contact.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
               <span className="truncate max-w-[150px]">{contact.address}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0">
        <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
          <button 
            onClick={handleDownloadCSV}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium shadow-md"
          >
            <FileSpreadsheet size={20} />
            Download CSV (Google Contacts)
          </button>
          <button 
            onClick={handleDownloadVCF}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md"
          >
            <UserPlus size={20} />
            Download VCF (Phone Book)
          </button>
        </div>
      </div>
      {/* Spacer for fixed bottom bar on mobile */}
      <div className="h-24 md:h-0"></div>
    </div>
  );
};

export default ResultsView;