'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import GooglePlacesSearch from '@/components/google-places-search';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { redirect, useParams, useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { CheckSquare, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/loading';
import { JobObject } from '@/types/job-types';
import { useJobs } from '@/hooks/use-jobs';
import { CenterPageLoading } from '@/components/loading';

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Your name is too short. Please enter a valid name.')
    .max(50, 'Your name is too long. Please enter a valid name.'),
  vehicles: z.number().int().gte(1).lte(30),
});

type SettingsFormValues = z.infer<typeof formSchema>;

type CustomerSettings = {
  name: string;
  address: string;
  vehicles: number;
};

interface Origin {
  lat: number;
  lng: number;
}

interface SettingsFormProps {
  initialSettings: CustomerSettings;
  origin: Origin;
}

interface NewAddressDetails {
  address: string;
  lat: number;
  lng: number;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

const libraries: ('places' | 'geometry' | 'drawing' | 'visualization')[] = [
  'places',
];

const SettingsForm: React.FC<SettingsFormProps> = ({
  initialSettings,
  origin,
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const center = useMemo(
    () => ({ lat: origin.lat, lng: origin.lng }),
    [origin.lat, origin.lng]
  );

  const [loading, setLoading] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [addressError, setAddressError] = useState(false);

  const [newAddressDetails, setNewAddressDetails] = useState<NewAddressDetails>(
    {
      address: '',
      lat: 0,
      lng: 0,
    }
  );

  useEffect(() => {
    if (initialSettings.address.length > 0) {
      setEditAddress(false);
      setNewAddressDetails({
        address: initialSettings.address,
        lat: origin.lat,
        lng: origin.lng,
      });
    } else {
      setEditAddress(true);
    }
  }, [initialSettings, origin]);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialSettings,
  });

  const { register, handleSubmit } = form;

  const onSubmit = async (data: SettingsFormValues) => {
    if (newAddressDetails.address.length > 0) {
      try {
        setLoading(true);

        let newData = {
          name: data.name,
          vehicles: data.vehicles,
        };
        let countryData = {
          country: 'au',
        };

        if (newAddressDetails.address.length > 0) {
          newData = {
            ...newData,
            ...newAddressDetails,
            ...countryData,
          };
        }

        await axios.patch(`/api/${params.customerId}/settings`, newData);

        router.refresh();

        toast({
          variant: 'default',
          title: 'Awesome!',
          description: 'Your settings have been updated.',
        });
        router.push(`/dashboard/${params.customerId}`);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh.',
          description: 'Something went wrong.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setAddressError(true);
    }
  };

  const handleSelect = (selectedAddress: JobObject) => {
    setNewAddressDetails({
      address: selectedAddress.address,
      lat: selectedAddress.lat,
      lng: selectedAddress.lng,
    });
    setEditAddress(false);
    setAddressError(false);
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  if (!isLoaded) {
    return <CenterPageLoading />;
  }

  return (
    <div className="">
      <Form {...form}>
        <form
          className="h-[100%] relative flex flex-col space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      disabled={loading}
                      maxLength={64}
                      placeholder="Enter your name/business name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicles"
              render={() => (
                <FormItem>
                  <FormLabel className="font-bold">Vehicles</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...register('vehicles', { valueAsNumber: true })}
                      min={1}
                      max={30}
                      autoComplete="off"
                      disabled={loading}
                      maxLength={64}
                      placeholder="Enter the number of vehicles you are operating with."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="relative ">
              <FormLabel
                className={cn(
                  'font-bold',
                  newAddressDetails.address.length === 0
                    ? 'text-destructive'
                    : ''
                )}
              >
                Address
              </FormLabel>
              <div className="absolute left-0 top-[-0.4rem] w-[100%]">
                <div className="flex justify-between items-center">
                  <FormControl className="w-full">
                    {editAddress ? (
                      isLoaded ? (
                        <GooglePlacesSearch
                          className="w-[90%] md:w-[95%] lg:w-[97%]"
                          handleSelected={handleSelect}
                          placeholder="Enter origin address."
                          restrictions={false}
                        />
                      ) : (
                        <Loading />
                      )
                    ) : (
                      <Label>{newAddressDetails.address}</Label>
                    )}
                  </FormControl>
                  <Button
                    className="absolute right-[-0.5rem] top-[.3rem]"
                    disabled={newAddressDetails.address.length === 0}
                    onClick={() => setEditAddress(!editAddress)}
                    size={'icon'}
                    variant={'ghost'}
                    type="button"
                  >
                    {editAddress === true ? <CheckSquare /> : <Edit />}
                  </Button>
                </div>
              </div>
              {newAddressDetails.address.length === 0 && (
                <p className={'text-sm font-medium text-destructive z-[1] relative top-[2rem]'}>
                  Please enter an address before starting.
                </p>
              )}
            </FormItem>
          </div>
          <div className="flex flex-col w-full h-[25rem]  md:h-[35rem] space-y-4 justify-end ">
            <GoogleMap
              zoom={10}
              center={center}
              mapContainerClassName="w-full h-[82%] md:h-[85%] rounded-[0.5rem]"
            >
              <MarkerF
                key={'origin'}
                position={center}
                icon={{
                  url: '/green.svg',
                  scaledSize: new window.google.maps.Size(45, 45),
                }}
              />
            </GoogleMap>
            <div className="w-full flex justify-end">
              <Button
                className="w-full md:w-[5rem]"
                disabled={loading || newAddressDetails.address.length === 0}
                type="submit"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
