'use client';
 
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
 
export default function Search({
  placeholder,
}: {
  placeholder: string,
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // debounced only runs the search after the 300ms of pausing of input (near end)
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    // Automatically creates a proper params string to append to URL (e.g ?page=1&query=a)
    const params = new URLSearchParams(searchParams);

    //below resets page back to 1 upon new search
    params.set('page', '1');
    
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // Uses replace method from useRouter to take the full path name and then 
    // append the params string after the ?
    replace(`${pathname}?${params.toString()}`);
  }, 300);
 
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => {
          handleSearch(e.target.value)
        }}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}